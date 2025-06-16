const Pagination = ({ setCurrentPage, currentPage, totalPages }) => {
    return (
        <div className="pagination">
            <button
                id="prevPageBtn"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
            >
                &laquo; Previous
            </button>
            <span>
                Page <span id="currentPageSpan">{currentPage}</span> of{" "}
                <span id="totalPagesSpan">{totalPages}</span>
            </span>
            <button
                id="nextPageBtn"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
            >
                Next &raquo;
            </button>
        </div>
    )
}

export default Pagination