const {Builder, By, Key, until, Capabilities} = require('selenium-webdriver');
const { getJsonData, appendDataInJson, appendLinkToTxt } = require('./fileController');
const { downloadImageToUrl } = require('./imgDownload');
const {init:dbInit,dbQuery} = require("../models");

(async function init() {
    const chrome = require('selenium-webdriver/chrome');
    const chromedriver = require('chromedriver');

    chrome.setDefaultService(new chrome.ServiceBuilder(chromedriver.path).build());
    var driver = new Builder().withCapabilities(Capabilities.chrome()).build();

    try {
        await dbInit();
        let movieData = await getJsonData("movie/movie.json");

        // Navigate to Url
        await driver.get('http://ticket.cgv.co.kr/Reservation/Reservation.aspx?MOVIE_CD=&MOVIE_CD_GROUP=&PLAY_YMD=&THEATER_CD=&PLAY_NUM=&PLAY_START_TM=&AREA_CD=&SCREEN_CD=&THIRD_ITEM=');
        await driver.sleep(1000);
        let mIdArr = [];
        let movieViewList = await driver.findElements(By.css("#movie_list > ul > li"));
        // console.log(movieViewList);
        for(let m of movieViewList) {
            let mId = await m.getAttribute("movie_idx");
            mIdArr.push(mId);
        };
        for(let mId of mIdArr) {
            await driver.get("http://www.cgv.co.kr/movies/detail-view/?midx="+ mId);
            try {
                // #paging_point li a ==> btn
                let pageBtns = await driver.findElements(By.css("#paging_point li > a"));
                let attempts = 0;

                while(attempts < pageBtns.length) {
                    try {
                        console.log(await pageBtns[attempts].getText());
                        await pageBtns[attempts].click();
                        attempts += 1;
                        await driver.sleep(1000);
                        // --review crawle--
                        let reviewListView = await driver.findElements(By.css("#movie_point_list_container > li"));
                        // console.log(reviewListView);
                        for(let rev of reviewListView) {
                            let revJson = {
                                "movie_id": mId,
                                "site": "cgv",
                                "created": (await rev.findElement(By.css(".writer-etc > span.day")).getText()).trim(),
                                "writer": (await  rev.findElement(By.css(".writer-name > a")).getText()).trim(),
                                "comment": (await rev.findElement(By.css(".box-comment > p")).getText()).trim(),
                                "like_num": Number((await rev.findElement(By.css(".btn_point_like #idLikeValue")).getText()).trim())
                            }
                            console.log(revJson);
                            let sql =  "INSERT INTO movie_review VALUES (?,?,?, ?,?,?)";
                            let params = [revJson.movie_id, revJson.site, revJson.created, revJson.writer, revJson.comment, revJson.like_num];
                            let queryRes = await dbQuery("INSERT", sql, params);
                        }
                        if(attempts >= pageBtns.length) {
                            try {
                                let nextBtn = await driver.findElement(By.css(".btn-paging.next"));
                                nextBtn.click();
                                attempts = 0;
                            } catch (error) {
                                console.log("while 나가기");
                                break;
                            }
                        }
                    } catch (error) {
                        console.log("pageBtns 새로고침");
                        pageBtns = await driver.findElements(By.css("#paging_point li > a"));
                    }
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
