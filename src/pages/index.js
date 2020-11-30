import React, { useEffect } from 'react';
import ReactGA from 'react-ga';
import LazyLoad from 'react-lazyload';
import Footer from '../components/Footer';
import HeaderBanner from '../components/HeaderBanner';
import SEO from '../components/SEO';
import { GA_ID } from '../config_app';
import FeedbackApps from '../container/landingpage/FeedbackApps';
import ListGreatApps from '../container/landingpage/ListGreatApps';
import StatictisApps from '../container/landingpage/StatictisApps';
import { oldUser, setScrollDownAuto } from '../utils';
import './home.css'

ReactGA.initialize(GA_ID);
const LandingPage = () => {
    useEffect(() => {
        ReactGA.pageview('/homepage');
        setScrollDownAuto()
        oldUser();
    }, [])
    return (
        <>
            <SEO url={'http://passemall.com/'} />
            <div className='body-panel landing-page'>
                <HeaderBanner />
                <LazyLoad>
                    <ListGreatApps />
                </LazyLoad>
                <StatictisApps />
                <FeedbackApps />
                <LazyLoad>
                    <link rel="stylesheet" type="text/css" href="/styles/slick.css" />
                </LazyLoad>
                <Footer color="#4E63BD"></Footer>
            </div>
        </>
    );
}

export default LandingPage;
