const {Builder, By, Key, until, Capabilities} = require('selenium-webdriver');
const { downloadImageToUrl } = require('../imgDownload');
const {init:dbInit,dbQuery} = require("../../models");
(async function example() {
    // let driver = await new Builder().forBrowser('chrome').build();
    const chrome = require('selenium-webdriver/chrome');
    const chromedriver = require('chromedriver');

    chrome.setDefaultService(new chrome.ServiceBuilder(chromedriver.path).build());
    var driver = new Builder().withCapabilities(Capabilities.chrome()).build();

    try {
        await dbInit();
        // Navigate to Url
        await driver.get('https://www.kobis.or.kr/kobis/business/mast/mvie/searchMovieList.do');
        await driver.sleep(500);
        await (driver.findElement(By.css(".slt_comm #sOrderBy > option:nth-child(4)"))).click();
        await driver.sleep(500);

        let pageBtns = await driver.findElements(By.css("#pagingForm > div > ul > li a"));
        let attempts = 0;

        while(attempts < pageBtns.length) {
            try {
                console.log(await pageBtns[attempts].getText());
                await pageBtns[attempts].click();
                attempts += 1;
                await driver.sleep(500);
                //
                let mListView = await driver.findElements(By.css("#content > div.rst_sch > table > tbody > tr"));
                //List foreach
                for(let rev of mListView) {
                    try {
                        let title = rev.findElement(By.css("td:nth-child(1) > span > a"));
                        let revJson = {
                            "movie_id": (await (rev.findElement(By.css("td:nth-child(3) > span"))).getText()).trim(),
                            "title":  (await title.getText()).trim(),
                            "eng_title": (await rev.findElement(By.css("td:nth-child(2) > span > a")).getText()).trim(),
                            "production_year": (await rev.findElement(By.css("td:nth-child(4) > span")).getAttribute("title")).trim(),
                            "production_country": (await rev.findElement(By.css("td:nth-child(5) > span")).getAttribute("title")).trim(),
                            "size_type": (await rev.findElement(By.css("td:nth-child(6) > span")).getAttribute("title")).trim(),
                            "genore": (await rev.findElement(By.css("td:nth-child(7) > span")).getAttribute("title")).trim(),
                            "production_status": (await rev.findElement(By.css("td:nth-child(8) > span")).getAttribute("title")).trim(),
                            "poster_img": null,
                            "release_date": null,
                            "updated_date": null,
                            "memo": null,
                            "director": (await rev.findElement(By.css("td:nth-child(9) > span")).getAttribute("title")).trim(),
                            "actor": {},
                            "story": ""
                        };
                        
                        // console.log(revJson);

                        await title.click();
                        await driver.sleep(500);

                        let href = await (await driver.findElement(By.css(".item_tab.basic > div.ovf.info.info1 > a"))).getAttribute("href");
                        console.log(href);
                        let urlArr = href.split("/"); 
                        let imgLink = `${Date.now()}_${urlArr[urlArr.length-1]}`;
                        if(urlArr[urlArr.length-1] == "searchMovieList.do#") {
                            revJson.poster_img = "";
                        } else {
                            downloadImageToUrl(href, imgLink);
                            revJson.poster_img = imgLink;
                        }
                        

                        
                        revJson.memo = (await driver.findElement(By.css(".item_tab.basic > div.ovf.info.info1 > dl > dd:nth-child(8)")).getText()).trim();
                        revJson.updated_date = (await driver.findElement(By.css(".item_tab.basic > div.bar_top > div")).getText()).trim().split("최종수정: ")[1].split(" 수정요청")[0];
                        revJson.release_date = (await driver.findElement(By.css(".item_tab.basic dl > dd:nth-child(10)")).getText()).trim();
                        try {
                            revJson.story = (await driver.findElement(By.css(".item_tab.basic  p.desc_info")).getText()).trim();
                        } catch (error) {
                            revJson.story = "";
                        }
                        
                        console.log(revJson);

                        await driver.findElement(By.css("div.hd_layer > a:nth-child(3)")).click();
                        await driver.sleep(500);

                        let sql = "INSERT INTO movie VALUES (?,?,?,?,?, ?,?,?,?,?, ?,?,?,?,?)";
                        let params = [revJson.movie_id, revJson.title, revJson.eng_title, revJson.production_year, revJson.production_country,
                            revJson.size_type, revJson.genore, revJson.production_status,revJson.poster_img, revJson.release_date,
                            revJson.updated_date,revJson.memo,revJson.director,JSON.stringify(revJson.actor),revJson.story];
                        let queryRes = await dbQuery("INSERT", sql, params);

                    } catch (error) {
                        console.log(error);
                    }
                    // appendDataInJson(["movie/movie.json", movieInfo, movieData], (res)=> {});
                    
                }

                if(attempts >= pageBtns.length) {
                    try {
                        let nextBtn = await driver.findElement(By.css("#pagingForm > div > a.btn.next"));
                        await nextBtn.click();
                        await driver.sleep(500);
                        pageBtns = await driver.findElements(By.css("#pagingForm > div > ul > li a"));
                        attempts = 0;
                        console.log(attempts);
                    } catch (error) {
                        console.log("while 나가기");
                        break;
                    }
                }
            } catch (err){
                console.log("pageBtns 새로고침");
                pageBtns = await driver.findElements(By.css("#pagingForm > div > ul > li a"));
                mListView = await driver.findElements(By.css("#content > div.rst_sch > table > tbody > tr"));
            }
        }
    }
    finally{
        // driver.quit(); 
    }
})();




// attempts 223번까지 했음.
