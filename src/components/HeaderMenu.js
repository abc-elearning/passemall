import { Container, Grid, IconButton, Link, SwipeableDrawer, useMediaQuery, useTheme } from "@material-ui/core";
import MenuIcon from '@material-ui/icons/Menu';
import { useState } from "react";
import ReactGA from 'react-ga';
import { APP_NEW_DOMAIN } from "../config_app";
import { isSuperApp, scrollToTopic } from "../utils";

const HeaderMenu = ({ appInfo, noHeader, headerMenu }) => {
    if(noHeader === true){
        return <Content appInfo={appInfo} headerMenu={headerMenu} />
    }
    return <header>
        <Content appInfo={appInfo} headerMenu={headerMenu} />
    </header>
}

const Content = ({ appInfo, headerMenu }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.between(0, 780));
    const [openDrawer, setOpenDrawer] = useState(false);
    const handleOpenDrawer = (open) => setOpenDrawer(open)
    return <Container>
        <Grid container alignItems="center" justify="space-between">
            <a href="/" style={{padding: "10px 0"}}>
                <img src="/images/logo-landing.png" alt="logo-app" width={isMobile ? "180px" : "240px"} height={isMobile ? "45px" : "60px"}></img>
            </a>
            {!isMobile ? <div className="header-menu">
                {headerMenu ? headerMenu : <MenuList appInfo={appInfo} />}
            </div> : <div className="header-menu-mobile">
                <IconButton onClick={() => handleOpenDrawer(true)}>
                    <MenuIcon style={{ color: "#fff" }}></MenuIcon>
                </IconButton>
                <SwipeableDrawer
                    className="header-menu-swipe"
                    anchor="right"
                    open={openDrawer}
                    onClose={() => {
                        handleOpenDrawer(false);
                    }}
                    onOpen={() => handleOpenDrawer(true)}
                >
                    <div style={{ width: "200px" }} className="menu-list">
                        <div className="header-mobile-bg">
                            <a href="/">
                                <img src="/images/logo-landing.png" alt="logo-app" width="100%"></img>
                            </a>
                        </div>
                        {headerMenu ? headerMenu : <MenuList appInfo={appInfo} />}
                    </div>
                </SwipeableDrawer>
            </div>}
        </Grid>
    </Container>
}

const MenuList = ({ appInfo }) => {
    let rootLink = '/';
    if(appInfo && (!isSuperApp(appInfo.id) || !APP_NEW_DOMAIN)){
        rootLink = appInfo.appNameId+'/';
    }
    return <>
        <div>
            <a href={rootLink}>HOME</a>
        </div>
        {!APP_NEW_DOMAIN ? <div>
            <span className="tag-a" href={rootLink} onClick={() => {
                ReactGA.event({
                    category: 'Click Learn',
                    action: 'Click Learn Header'
                })
                scrollToTopic()
            }}>LEARN</span>
        </div> : null}
        {/* <div onClick={() => {
                ReactGA.event({
                    category: 'Click Test',
                    action: 'Click Test Header'
                })
            }}>
            <Link href={rootLink + "test"}>TEST</Link>
        </div> */}
        <div onClick={() => {
                ReactGA.event({
                    category: 'Click Review',
                    action: 'Click Review Header'
                })
            }}>
            <Link href={rootLink + "review"}>REVIEW</Link>
        </div>
        <div onClick={() => {
                ReactGA.event({
                    category: 'Click Blog',
                    action: 'Click Blog Header',
                    value: appInfo.id
                })
            }}>
            <Link href={"/blog" + (appInfo ? "?appId=" + appInfo.id : '')}>BLOG</Link>
        </div>
    </>
}

export default HeaderMenu;