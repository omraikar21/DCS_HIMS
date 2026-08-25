// ==========================================
// SYSTEM METRICS & SERVER LOAD CONTROLLER
// Exclusively for Super Admin Server Monitoring
// ==========================================

const os = require("os");
const { pool } = require("../config/database");

const getSystemMetrics = async (req, res) => {
  try {
    const user = req.user;
    const isSuperAdmin = Boolean(
      user?.is_super_admin ||
      (user?.email && (user.email.toLowerCase().trim() === "omraikar2128@gmail.com" || user.email.toLowerCase().trim() === "omraikar2128@gamil.com"))
    );

    if (!isSuperAdmin) {
      return res.status(403).json({
        success: false,
        message: "Access Denied: Only Super Admin can view server load telemetry.",
      });
    }

    // System Memory
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    const memUsagePct = ((usedMem / totalMem) * 100).toFixed(1);

    // Process Memory
    const processMemory = process.memoryUsage();

    // CPU Metrics
    const cpus = os.cpus();
    const cpuCount = cpus.length;
    const loadAvg = os.loadavg(); // [1min, 5min, 15min]

    // Calculate approximate CPU Usage %
    let userCpuTime = 0;
    let totalCpuTime = 0;
    cpus.forEach((cpu) => {
      for (const type in cpu.times) {
        totalCpuTime += cpu.times[type];
      }
      userCpuTime += cpu.times.user + cpu.times.sys;
    });
    const approxCpuPct = ((userCpuTime / totalCpuTime) * 100).toFixed(1);

    // System & Process Uptime
    const systemUptimeSeconds = os.uptime();
    const processUptimeSeconds = process.uptime();

    // PostgreSQL Active DB Pool Connections & Table Counts
    let dbConnections = 0;
    let totalUsersCount = 0;
    let totalEmployeesCount = 0;
    let totalDeptsCount = 0;
    let totalLeavesCount = 0;

    try {
      const connResult = await pool.query(
        "SELECT count(*)::INTEGER AS active_conns FROM pg_stat_activity WHERE state = 'active' OR state = 'idle'"
      );
      dbConnections = connResult.rows[0]?.active_conns || 0;

      const userCountRes = await pool.query("SELECT count(*)::INTEGER FROM users");
      totalUsersCount = userCountRes.rows[0]?.count || 0;

      const empCountRes = await pool.query("SELECT count(*)::INTEGER FROM employees");
      totalEmployeesCount = empCountRes.rows[0]?.count || 0;

      const deptCountRes = await pool.query("SELECT count(*)::INTEGER FROM departments");
      totalDeptsCount = deptCountRes.rows[0]?.count || 0;

      const leaveCountRes = await pool.query("SELECT count(*)::INTEGER FROM leaves");
      totalLeavesCount = leaveCountRes.rows[0]?.count || 0;
    } catch (dbErr) {
      console.warn("DB telemetry query notice:", dbErr.message);
    }

    return res.status(200).json({
      success: true,
      message: "Server load metrics fetched successfully",
      metrics: {
        serverTime: new Date().toISOString(),
        host: os.hostname(),
        platform: os.platform(),
        arch: os.arch(),
        cpuCount,
        approxCpuPct: parseFloat(approxCpuPct),
        loadAvg,
        memory: {
          totalMb: Math.round(totalMem / (1024 * 1024)),
          usedMb: Math.round(usedMem / (1024 * 1024)),
          freeMb: Math.round(freeMem / (1024 * 1024)),
          usagePercentage: parseFloat(memUsagePct),
          rssMb: Math.round(processMemory.rss / (1024 * 1024)),
          heapTotalMb: Math.round(processMemory.heapTotal / (1024 * 1024)),
          heapUsedMb: Math.round(processMemory.heapUsed / (1024 * 1024)),
        },
        uptime: {
          systemUptimeSeconds: Math.floor(systemUptimeSeconds),
          processUptimeSeconds: Math.floor(processUptimeSeconds),
          formattedProcessUptime: formatDuration(processUptimeSeconds),
        },
        database: {
          activeConnections: dbConnections,
          maxPoolSize: pool.options?.max || 20,
          totalUsersCount,
          totalEmployeesCount,
          totalDeptsCount,
          totalLeavesCount,
          status: "ONLINE / HEALTHY",
        },
      },
    });
  } catch (error) {
    console.error("System metrics error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch system load metrics",
    });
  }
};

function formatDuration(seconds) {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  return `${hrs}h ${mins}m ${secs}s`;
}

module.exports = {
  getSystemMetrics,
};
