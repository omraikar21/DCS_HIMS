function LoadingSkeleton({
  rows = 5,
  columns = 5,
}) {

  return (
    <div className="loading-skeleton-wrapper">

      {Array.from(
        { length: rows }
      ).map(
        (_, rowIndex) => (

          <div
            className="loading-skeleton-row"
            key={rowIndex}
          >

            {Array.from(
              { length: columns }
            ).map(
              (_, columnIndex) => (

                <div
                  className="loading-skeleton-cell"
                  key={columnIndex}
                />

              )
            )}

          </div>

        )
      )}

    </div>
  );
}


export default LoadingSkeleton;