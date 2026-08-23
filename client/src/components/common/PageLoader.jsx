function PageLoader() {
  return (
    <div className="route-loading" style={{ minHeight: "60vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <div className="route-loading-spinner" />
      <p style={{ marginTop: "16px", color: "#64748b", fontSize: "14px", fontWeight: 500 }}>
        Loading module...
      </p>
    </div>
  );
}

export default PageLoader;
