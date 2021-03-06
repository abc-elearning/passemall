import { Button, Container, Grid, IconButton } from '@material-ui/core';
import { useTheme } from '@material-ui/core/styles';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import { ArrowBack as ArrowBackIcon } from '@material-ui/icons';
import { useRouter } from 'next/router';
import React, { useEffect } from 'react';
import ReactGA from 'react-ga';
import { connect } from 'react-redux';
import { ShowImage } from '../../components/Dialog';
import Footer from '../../components/Footer';
import HeaderMenu from '../../components/HeaderMenu';
import Image from '../../components/Image';
import { LoadingWidget } from '../../components/Widgets';
import Config from '../../config';
import { GA_ID } from '../../config_app';
import ReviewProgress from '../../models/ReviewProgress';
import { scrollToTop } from '../../models/Utils';
import { getAllCardProgress } from '../../redux/actions/cardProgress';
import { checkLoadedReceiveProps, isMobileFunctions, isSuperApp } from '../../utils';
import { QuestionsPanelTS } from '../game/Game.ViewTS';

ReactGA.initialize(GA_ID);

const ReviewViewScreen = ({ appInfo }) => {
    const router = useRouter();
    let { appNameId, screen } = router.query
    let topicId = -1;
    if (screen) {
        let offset = screen.lastIndexOf('-') + 1;
        topicId = offset > -1 ? parseInt(screen.substring(offset, screen.length)) : -1;
    }
    appNameId = appNameId ?? '';
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    useEffect(() => {
        if (isMobile) {
            scrollToTop();
        }
        ReactGA.pageview(window.location.pathname, ["review-page"], 'review-page');
    }, [isMobile]);
    if (!appInfo) {
        return <LoadingWidget />
    }
    useEffect(() => {
        ReactGA.pageview('/reviewpage/' + appInfo.title);
    }, [])
    return (
        <ReviewView appInfo={appInfo} topicId={topicId} />
    );
}

class ReviewViewScreenUI extends React.Component {

    constructor(props) {
        let isMobile = isMobileFunctions();
        super(props);
        this.state = {
            appInfo: props.appInfo,
            levelId: -1,
            questionIds: null,
            showReview: false,
            isMobile: isMobile
        }
    }

    componentDidMount() {
        this.props.getAllCardProgress();
    }

    UNSAFE_componentWillReceiveProps(nextProps) {
        if (!checkLoadedReceiveProps(this.props.cardProgressReducer, nextProps.cardProgressReducer)) {
            let reviewProgress = getReviewProgress(this.props.cardProgressReducer);
            if (this.state.levelId == -1) {
                let levelIdSelected = reviewProgress.getCurrentSelectedId();
                this.setState({
                    levelId: levelIdSelected,
                    questionIds: reviewProgress.getQuestionsIdsByLevelId(levelIdSelected)
                });
            }
        }
    }

    render() {
        let reviewProgress = getReviewProgress(this.props.cardProgressReducer);
        if (!reviewProgress) {
            return <LoadingWidget color={null} />;
        }
        let levelIdSelected = -1;
        let questionIds = new Array();
        if (this.state.levelId == -1) {
            levelIdSelected = reviewProgress.getCurrentSelectedId();
            questionIds = reviewProgress.getQuestionsIdsByLevelId(levelIdSelected);
        } else {
            levelIdSelected = this.state.levelId;
            questionIds = this.state.questionIds;
        }
        let linkTest = "/" + this.state.appInfo.appNameId + "/test";
        if(isSuperApp(this.state.appInfo.id)){
            linkTest = "/test";
        }
        return (
            <div className="body-panel review-page">
                <HeaderMenu appInfo={this.state.appInfo} darkMode={true} />
                <Container className={'review-page-content' + (this.state.isMobile && this.state.showReview ? ' show-review' : '')}>
                    <Grid
                        container
                        direction="row"
                        alignItems="stretch"
                        spacing={this.state.isMobile ? 0 : 3}
                        style={{height: "100%"}}
                    >
                        <Grid className="left-panel border-box" item xs={12} sm={12} md={4}
                            style={this.state.isMobile ? { display: this.state.showReview ? 'none' : 'block' } : {}}>
                            <LevelQuestionPanel
                                activeId={levelIdSelected}
                                gameProgress={reviewProgress}
                                onSelected={(item) => {
                                    this.setState({
                                        levelId: item.id,
                                        questionIds: reviewProgress.getQuestionsIdsByLevelId(item.id),
                                        showReview: true
                                    });
                                }} />
                        </Grid>
                        <Grid className="right-panel border-box" item xs={12} sm={12} md={8}
                            style={this.state.isMobile ? { display: !this.state.showReview ? 'none' : 'block' } : {}}>
                            {this.state.isMobile && this.state.showReview ? <Grid container alignItems="center" >
                                <IconButton onClick={() => {
                                    this.setState({
                                        showReview: false
                                    })
                                }}><ArrowBackIcon /></IconButton>
                                <span>{Config.LEVEL_QUESTION.map((item) => {
                                    if (this.state.levelId === item.id) {
                                        return item.name;
                                    }
                                    return '';
                                })}</span>
                            </Grid> : ''}
                            {
                                questionIds.length > 0 ? <QuestionsPanelTS
                                    appInfo={this.state.appInfo}
                                    className="question-view-study-game border-box"
                                    examId={-1}
                                    gameType={Config.REVIEW_GAME}
                                    questionIds={questionIds}
                                /> : <div className="empty-question-panel">
                                    <div style={{marginBottom: "15px"}}>Start practice now to evaluate your knowledge</div>
                                    <Button href={linkTest} variant="contained" color="primary">START PRACTICE TEST NOW</Button>
                                </div>
                            }
                        </Grid>
                    </Grid>
                    {this.state.isMobile && !this.state.showReview ? <Footer isStudy={true}></Footer> : null}
                </Container>
                <ShowImage />
            </div>
        );
    }
}

const LevelQuestionPanelUI = (props) => {
    let gameProgress = props?.gameProgress;
    let onSelected = props.onSelected ?? function () { console.error("onSelected null") };
    return (
        <div className="level-question-panel">
            {
                Config.LEVEL_QUESTION.map((item) => {
                    let totalQuestion = gameProgress ? gameProgress.getTotalQuestionByLevelId(item.id) : 0;
                    return <LevelQuestionItem
                        active={props.activeId === item.id}
                        item={item}
                        totalQuestion={totalQuestion}
                        key={'level-question-item-' + item.id}
                        onSelected={onSelected}
                    />;
                })
            }
        </div>
    );
}

const LevelQuestionItem = ({ item, totalQuestion, active, onSelected }) => {
    totalQuestion = totalQuestion ? totalQuestion : 0;
    return (
        <div className={"level-question-item" + (active ? " active" : "")} onClick={() => onSelected(item)}>
            <Grid
                container
                direction="row"
                alignItems="center"
            >
                <div style={{ 'width': 'calc(100% - 40px)' }}>
                    <label>{item.name}</label>
                    <div className="question-num">{totalQuestion} questions</div>
                </div>
                <div style={{ 'width': '40px' }}>
                    <Image src={item.image} width='25px' height="25px" />
                </div>
            </Grid>
        </div>
    );
}

function getReviewProgress(cardProgressState) {
    if (cardProgressState && cardProgressState.data) {
        return new ReviewProgress(Object.values(cardProgressState.data));
    }
    return null;
}

const mapStateToProps = (state, ownProps) => {
    return {
        cardReducer: state.cardReducer,
        cardProgressReducer: state.cardProgressReducer,
        ...ownProps
    };
}

const mapDispatchToProps = (dispatch) => ({
    getAllCardProgress: () => dispatch(getAllCardProgress()),
});

const LevelQuestionPanel = connect(mapStateToProps, null)(LevelQuestionPanelUI);
const ReviewView = connect(mapStateToProps, mapDispatchToProps)(ReviewViewScreenUI);



export default ReviewViewScreen;