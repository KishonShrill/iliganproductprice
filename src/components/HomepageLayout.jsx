import PropTypes from "prop-types";
import { Outlet } from "react-router-dom";
import Header from "./homepage/Header";
import BottomNavigation from "./BottomNavigation";
import useSettings from "../hooks/useSettings";

import '../styles/main-header.scss'

function HomepageLayout({ token }) { 
    
  const { settings } = useSettings();

  return (
    <>
      <Header token={token} />
      <Outlet />
      <BottomNavigation />
    </>
  );
}

HomepageLayout.displayName = "Homepage Layout"
HomepageLayout.propTypes = {
    token: PropTypes.any
}

export default HomepageLayout
