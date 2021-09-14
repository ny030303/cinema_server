const {Builder, By, Key, until, Capabilities} = require('selenium-webdriver');
const {getJsonData, appendDataInJson, appendLinkToTxt} = require('../fileController');
const {init: dbInit, dbQuery, getTodayMovies} = require("../../controllers/dbController");
const iconv = require("iconv-lite");

const chrome = require('selenium-webdriver/chrome');
const chromedriver = require('chromedriver');
const implicit_wait = {implicit: 5000, pageLoad: 5000};

chrome.setDefaultService(new chrome.ServiceBuilder(chromedriver.path).build());
Array.prototype.division = function (n) {
    let arr = this;
    let len = arr.length;
    let cnt = Math.floor(len / n) + (Math.floor(len % n) > 0 ? 1 : 0);
    let ret = [];
    for (let i = 0; i < cnt; i++) {
      ret.push(arr.splice(0, n));
    }
    return ret;
  }
const loadSelenium = () => {
    let options = new chrome.Options();
    // options.headless();
    options.addArguments('--headless --disable-gpu');     // GPU 사용 안함
    options.addArguments('lang=ko_KR');      //  언어 설정
    return new Builder().withCapabilities(Capabilities.chrome()).setChromeOptions(options).build();
    // return new Builder().withCapabilities(Capabilities.chrome()).setChromeOptions(new chrome.Options().headless()).build();
}

const getMListView = async (driver) => {
    await driver.get('https://www.kobis.or.kr/kobis/business/mast/mvie/searchMovieList.do');
    await driver.manage().setTimeouts(implicit_wait);
    await (driver.findElement(By.css(".slt_comm #sOrderBy > option:nth-child(4)"))).click();
    await driver.manage().setTimeouts(implicit_wait);
    return await driver.findElements(By.css("#content > div.rst_sch > table > tbody > tr"));
}

(async function example() {
    const driver = loadSelenium();
    try {
        let mListView = await getMListView(driver);
        await driver.manage().setTimeouts(implicit_wait);
        let pageBtns = await driver.findElements(By.css("#pagingForm > div > ul > li a"));
        let attempts = 0;
        while(attempts < pageBtns.length) {
            try {
                let nowNum = await pageBtns[attempts].getText();
                for(const movies of mListView.division(10)) {
                    await Promise.all(movies.map( async (v,i) => movieInfoByWebDriver(nowNum, i)));
                }
                pageBtns = await driver.findElements(By.css("#pagingForm > div > ul > li a"));
                await driver.manage().setTimeouts(implicit_wait);
                attempts += 1;
                await pageBtns[attempts].click();
                await driver.manage().setTimeouts(implicit_wait);
                if(attempts >= pageBtns.length) {
                    try {
                        let nextBtn = await driver.findElement(By.css("#pagingForm > div > a.btn.next"));
                        await nextBtn.click();
                        await driver.manage().setTimeouts(implicit_wait);
                        pageBtns = await driver.findElements(By.css("#pagingForm > div > ul > li a"));
                        await driver.manage().setTimeouts(implicit_wait);
                        attempts = 0;
                        console.log(attempts);
                    } catch (error) {
                        console.log(error);
                        console.log("while 나가기");
                        break;
                    }
                }
            } catch (error) {
                console.log("this?: " + error);
                pageBtns = await driver.findElements(By.css("#pagingForm > div > ul > li a"));
                mListView = await driver.findElements(By.css("#content > div.rst_sch > table > tbody > tr"));
                // break;
            }
        }
        await driver.sleep(500);
      } catch (error) {
        console.log(error);
      } finally {
        console.log("✨ finished ✨");
        driver.quit();
      }

})();

const movieInfoByWebDriver = async (nowNum, i) => {
    const driver = loadSelenium();
    console.log(nowNum);
    try {
        await driver.get('https://www.kobis.or.kr/kobis/business/mast/mvie/searchMovieList.do');
        await driver.manage().setTimeouts(implicit_wait);
        await (driver.findElement(By.css(".slt_comm #sOrderBy > option:nth-child(4)"))).click();
        await driver.sleep(2000);
        let mListView = await driver.findElements(By.css("#content > div.rst_sch > table > tbody > tr"));
        await driver.manage().setTimeouts(implicit_wait);
        let title = mListView[i].findElement(By.css("td:nth-child(1) > span > a"));
        let mJson = {
            "movie_id": (await (mListView[i].findElement(By.css("td:nth-child(3) > span"))).getText()).trim(),
            "title":  (await title.getText()).trim(),
            "eng_title": (await mListView[i].findElement(By.css("td:nth-child(2) > span > a")).getText()).trim(),
            "production_year": (await mListView[i].findElement(By.css("td:nth-child(4) > span")).getAttribute("title")).trim(),
            "production_country": (await mListView[i].findElement(By.css("td:nth-child(5) > span")).getAttribute("title")).trim(),
            "size_type": (await mListView[i].findElement(By.css("td:nth-child(6) > span")).getAttribute("title")).trim(),
            "genore": (await mListView[i].findElement(By.css("td:nth-child(7) > span")).getAttribute("title")).trim(),
            "production_status": (await mListView[i].findElement(By.css("td:nth-child(8) > span")).getAttribute("title")).trim(),
            "poster_img": null, "release_date": null, "updated_date": null, "memo": null,
            "director": (await mListView[i].findElement(By.css("td:nth-child(9) > span")).getAttribute("title")).trim(),
            "actor": {}, "story": ""
        };
        await driver.manage().setTimeouts(implicit_wait);
        await title.click();
        await driver.sleep(2000);
        let href = await (await driver.findElement(By.css(".item_tab.basic > div.ovf.info.info1 > a"))).getAttribute("href");
        let urlArr = href.split("/"); 
        let imgLink = `${Date.now()}_${urlArr[urlArr.length-1]}`;
        if(urlArr[urlArr.length-1] == "searchMovieList.do#") { mJson.poster_img = "";} 
        else { mJson.poster_img = imgLink; }
        
        mJson.memo = (await driver.findElement(By.css(".item_tab.basic > div.ovf.info.info1 > dl > dd:nth-child(8)")).getText()).trim();
        mJson.updated_date = (await driver.findElement(By.css(".item_tab.basic > div.bar_top > div")).getText()).trim().split("최종수정: ")[1].split(" 수정요청")[0];
        await driver.manage().setTimeouts(implicit_wait);
        let dts = await driver.findElements(By.css(".item_tab.basic dl > *"));
        await driver.manage().setTimeouts(implicit_wait);
        await console.log(mJson);
    } catch (error) {
        
    } finally {
        try {
          await driver.close();
          await console.log("✨ graph finished ✨");
          // 일반적으로 driver.close()브라우저를 닫고(드라이버 인스턴스는 그대로 driver.quit()유지됨) webdriver 인스턴스를 종료합니다.
        } catch (ter) {
          console.log(ter);
        }
        
      }
    
  };