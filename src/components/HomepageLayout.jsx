import { Suspense } from "react";
import PropTypes from "prop-types";
import { Outlet } from "react-router-dom";
import Header from "./homepage/Header";
import BottomNavigation from "./BottomNavigation";

import '../styles/main-header.scss'

function HomepageLayout({ token }) {

    return (
        <>
            <Header token={token} />
            <Suspense fallback={(
                <main className='errorDisplay'>
                    <h2>Loading<span className="animated-dots"></span></h2>
                </main>
            )}>
                <Outlet />
            </Suspense>
            <BottomNavigation />
        </>
    );
}

HomepageLayout.displayName = "Homepage Layout"
HomepageLayout.propTypes = {
    token: PropTypes.any
}

export default HomepageLayout
