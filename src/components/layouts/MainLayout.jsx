import { Suspense } from "react";
import PropTypes from "prop-types";
import { Outlet } from "react-router-dom";
import Header from "@/components/homepage/Header";
import MainBottomNav from "@/components/MainBottomNav";

import '@/styles/main-header.scss'

function HomepageLayout() {

    return (
        <>
            <Header />
            <Suspense fallback={
                <div className='errorDisplay'>
                    <h2 className="text-lg">Loading<span className="animated-dots"></span></h2>
                </div>
            }>
                <Outlet />
            </Suspense>
            <MainBottomNav />
        </>
    );
}

HomepageLayout.displayName = "Homepage Layout"
HomepageLayout.propTypes = {
    token: PropTypes.any
}

export default HomepageLayout
