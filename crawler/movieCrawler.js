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
            await driver.sleep(1500);
            let href = await (await driver.findElement(By.css(".sect-base-movie .box-image > a"))).getAttribute("href");
            console.log(href);
            let urlArr = href.split("/"); 
            let imgLink = `${Date.now()}_${urlArr[urlArr.length-1]}`;
            downloadImageToUrl(href, imgLink);
            try {
                let peopleView = await driver.findElements(By.css(".sect-base-movie div.spec > dl > dd > a"));
                let genreView = await driver.findElement(By.css(".sect-base-movie div.spec > dl > dt:nth-child(6)"));
                let onView = await driver.findElements(By.css(".sect-base-movie div.spec > dl > dd.on"));
                let storyView = await driver.findElement(By.css(".sect-story-movie"));

                console.log(peopleView.length ," , ", !genreView ," , ",  onView.length ," , ", !storyView);
                if (peopleView.length <= 0 || !genreView || onView.length <= 0 || !storyView) {
                    console.log("can't search");
                    appendLinkToTxt(["movie/otherMovieLink.txt", "Can't search: http://www.cgv.co.kr/movies/detail-view/?midx="+ mId + "\n"], (res)=> {});
                } else {
                    let movieInfo = {
                        "movie_id": mId,
                        "title": await (await driver.findElement(By.css(".box-contents .title > strong"))).getText(),
                        "poster_img": imgLink,
                        "play_time": Number((await onView[1].getText()).split(",")[1].slice(0,-1).trim()),
                        "director": (await peopleView[0].getText()).trim(),
                        "cast_members": "",
                        "genre": (await genreView.getText()).split(":")[1].trim() ,
                        "release_date": (await onView[1].getText()).split(",")[1].trim(),
                        "grade": (await onView[1].getText()).split(",")[0].trim(),
                        "story": await storyView.getText()
                    };
                    peopleView.splice(0,1);
                    for(let p of peopleView) {
                        let pName = await p.getText();
                        movieInfo.cast_members = movieInfo.cast_members + "," + pName;
                    };
                    console.log(movieInfo);
                    appendDataInJson(["movie/movie.json", movieInfo, movieData], (res)=> {});
                    let sql = "INSERT INTO movie VALUES (?,?,?,?,?, ?,?,?,?,?)";
                    let params = [movieInfo.movie_id, movieInfo.title, movieInfo.poster_img, movieInfo.play_time, movieInfo.director, 
                                movieInfo.cast_members, movieInfo.genre, movieInfo.release_date, movieInfo.grade, movieInfo.story];
                    let queryRes = await dbQuery("INSERT", sql, params);
                }
                
            } catch (error) {
                console.log(error);
                appendLinkToTxt(["movie/otherMovieLink.txt", "Error: http://www.cgv.co.kr/movies/detail-view/?midx="+ mId + "\n"], (res)=> {});
            }
        }
        
    } catch(err) {
        console.log(err);
    }
    finally{
        await driver.quit(); 
    }
})();
