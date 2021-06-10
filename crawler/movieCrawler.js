const {Builder, By, Key, until, Capabilities} = require('selenium-webdriver');
const { getJsonData, appendDataInJson } = require('./fileWriter');

(async function init() {
    const chrome = require('selenium-webdriver/chrome');
    const chromedriver = require('chromedriver');

    chrome.setDefaultService(new chrome.ServiceBuilder(chromedriver.path).build());
    var driver = new Builder().withCapabilities(Capabilities.chrome()).build();

    try {
        let areaData = await getJsonData("area.json");
        let theaterData = await getJsonData("theater.json");

        // Navigate to Url
        await driver.get('http://ticket.cgv.co.kr/Reservation/Reservation.aspx?MOVIE_CD=&MOVIE_CD_GROUP=&PLAY_YMD=&THEATER_CD=&PLAY_NUM=&PLAY_START_TM=&AREA_CD=&SCREEN_CD=&THIRD_ITEM=');
        await driver.sleep(1000);
        let mIdArr = [];
        let movieViewList = await driver.findElements(By.css("#movie_list > ul > li"));
        // console.log(movieViewList);
        for(let m of movieViewList) {
            let mId = await m.getAttribute("movie_idx");
            // console.log(mId);
            mIdArr.push(mId);
        };
        for(let mId of mIdArr) {
            await driver.get("http://www.cgv.co.kr/movies/detail-view/?midx="+ mId);
            await driver.sleep(1500);
        }
        
    }
    finally{
        await driver.quit(); 
    }
})();
