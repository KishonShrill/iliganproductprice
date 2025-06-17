import { forwardRef } from "react"
import PropTypes from "prop-types"

const Searchbar = forwardRef(({ type, children, onChange }, ref) => {
    return (
        <>
            <div className="searchbar-container">
                <img className="searchbar-logo" src="/UI/search-01-stroke-rounded.svg" alt="Search Logo" />
                <input 
                    ref={ref} 
                    className="searchbar" 
                    type={type}
                    placeholder="Search" 
                    onChange={onChange}
                />
            </div>
            {children}
        </>
    )
})

Searchbar.displayName = "Searchbar"
Searchbar.propTypes = {
    type: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    children: PropTypes.element,
}

export default Searchbar