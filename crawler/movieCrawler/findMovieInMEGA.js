const {Builder, By, Key, until, Capabilities} = require('selenium-webdriver');
const { getJsonData, appendDataInJson, appendLinkToTxt } = require('../fileController');
const { downloadImageToUrl } = require('../imgDownload');
const {init:dbInit,dbQuery} = require("../../models");
const {crawleMovieReview} = require("./crawleReviewInMEGA");

(async function init() {
    const chrome = require('selenium-webdriver/chrome');
    const chromedriver = require('chromedriver');

    chrome.setDefaultService(new chrome.ServiceBuilder(chromedriver.path).build());
    var driver = new Builder().withCapabilities(Capabilities.chrome()).build();
    // SELECT * FROM `movie` where release_date NOT LIKE '____-__-__' <<=  release_date를 알 수 없는 정보 (나중에 처리 필요)
    try {
        await dbInit();

        let sql =  "SELECT * FROM movie WHERE production_status = '개봉' AND release_date LIKE '____-__-__' ORDER BY production_year DESC";
        let queryRes = await dbQuery("GET", sql, []);
        for(let movie of queryRes.row) {
            await driver.get("https://www.megabox.co.kr/movie?searchText="+ movie.title);
            await driver.sleep(500);
            // title, release_date, eng_title(선택)
            try {
                let movieBoxesView = null;
                try {
                    // noresult section 찾으면
                    movieBoxesView = await driver.findElements(By.css(".movie-list > #movieList > li"));
                    let isBreakWhile = await findMovieInBoxList(driver, movie, movieBoxesView);
                } 
                catch (err) {
                    console.log("해당 조건에 데이터가 존재하지 않음");
                    appendLinkToTxt(["movie/otherMovieLinkInMEGA.txt", "Can't search: "+ movie.movie_id +"\n"], (res)=> {});
                    
                };
            } catch (error) {
                console.log(error);
                console.log("해당 조건에 데이터가 존재하지 않음");
            }
            
        }
        
    } catch(err) {
        console.log(err);
    }
    finally{
        await driver.quit(); 
    }
})();


async function findMovieInBoxList(driver, movie, movieBoxesView) {
    let res = false;
    for(let box of movieBoxesView) {
        try {
            let b_title = (await box.findElement(By.css("div.tit-area > p.tit")).getText()).trim();
            let b_release_date = (await box.findElement(By.css("div.rate-date > span.date")).getText()).trim().split(" ")[1];
            console.log("b_title: ", b_title, " b_release_date: ", b_release_date.replace(/\./g, '-'));
            if(movie.title == b_title && movie.release_date == b_release_date.replace(/\./g, '-')) {
                console.log("movie 찾음");
                res = true;
                await (await box.findElement(By.css("div.movie-list-info > img"))).click();
                await driver.sleep(1000);
                let mHref = await driver.getCurrentUrl();
                await crawleMovieReview(driver, movie, mHref);
                // driver, movie, link
                break;
            }
        } catch (error) {
            console.log("movieBoxesView err");
            console.log(error);
        }
        
    }
    return res;
}