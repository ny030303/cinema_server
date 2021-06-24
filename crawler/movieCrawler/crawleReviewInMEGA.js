const {Builder, By, Key, until, Capabilities} = require('selenium-webdriver');
const { getJsonData, appendDataInJson, appendLinkToTxt } = require('../fileController');
const { downloadImageToUrl } = require('../imgDownload');
const {dbQuery} = require("../../models");
exports.crawleMovieReview = async (driver, movie, mHref)  => {
    try {
        await driver.get(mHref);
        // console.log(movie, mHref);
        
        try {
            // #paging_point li a ==> btn
            let showBtn = await driver.findElement(By.css("#contentData > div:nth-child(5) > div.tab-list.fixed > ul > li:nth-child(2) > a"));
            await showBtn.click();
            await driver.sleep(500);
            let pageBtns = await driver.findElements(By.css(".pagination > a"));
            let attempts = 0;
            // console.log(pageBtns);
            if(pageBtns.length > 0) {
                while(attempts < pageBtns.length) {
                    try {

                        console.log(await pageBtns[attempts].getText());
                        await findReviewInBoxList(driver, movie);

                        
                        // --review crawle--
                        
                        console.log(attempts, pageBtns.length);
                        if(attempts >= pageBtns.length) {
                            try {
                                if(Number.isNaN(Number(await pageBtns[attempts-1].getText()))) {
                                    let nextBtn = await driver.findElement(By.css(".pagination > a.control.next"));
                                    nextBtn.click();
                                    attempts = 0;
                                } else {
                                    await pageBtns[attempts].click();
                                    attempts += 1;
                                    await driver.sleep(1000);
                                }
                            } catch (error) {
                                console.log("while 나가기");
                                break;
                            }
                        }
                        
                    } catch (error) {
                        console.log("pageBtns 새로고침");
                        pageBtns = await driver.findElements(By.css(".pagination > a"));
                    }
                };
            }else {
                await findReviewInBoxList(driver, movie);
            }
        } catch (error) {
            console.log(error);
            console.log("해당 조건에 데이터가 존재하지 않음");
        }
    } catch(err) {
        console.log(err);
    }
}

async function findReviewInBoxList(driver, movie) {
    let res = false;
    let reviewListView = await driver.findElements(By.css("#contentData > div > div.movie-idv-story > ul > li.oneContentTag"));
    // console.log(reviewListView);
    for(let rev of reviewListView) {
        let reviewDate = (await rev.findElement(By.css("div.story-date > div > span")).getText()).trim();
        let created = getCreatedDate(reviewDate);
        // console.log(created);
        let revJson = {
            "movie_id": movie.movie_id,
            "site": "mega",
            "created": created,
            "writer": (await  rev.findElement(By.css("div.story-area > div.user-prof > p")).getText()).trim(),
            "comment": (await rev.findElement(By.css("div.story-area > div.story-box > div > div.story-cont > div.story-txt")).getText()).trim(),
            "like_num": Number((await rev.findElement(By.css("div.story-area > div.story-box > div > div.story-cont > div.story-like > button > span")).getText()).trim()),
            "rating_num":  Number((await rev.findElement(By.css("div.story-area > div.story-box > div > div.story-cont > div.story-point > span")).getText()).trim())
            
        }
        // console.log(revJson);
        // let sql =  "INSERT INTO movie_review VALUES (?,?,?, ?,?,?,?)";
        // let params = [revJson.movie_id, revJson.site, revJson.created, revJson.writer, revJson.comment, revJson.like_num, -1];
        // let queryRes = await dbQuery("INSERT", sql, params);
    }
    return res;
}

function getCreatedDate(reviewDate) {
    let ymd;
    let regex = RegExp(/^\d{4}\.(0[1-9]|1[012])\.(0[1-9]|[12][0-9]|3[01])$/);
    if(regex.test(reviewDate)) {
        ymd = new Date(reviewDate.replace(/\./g, '-')).toISOString();
    } else {
        let textArr = reviewDate.split(" ");
        let reviewDateTime;
        switch(textArr[1]) {
            case "분전":
                reviewDateTime = new Date().getTime() - new Date(0).setMinutes(Number(textArr[0]));
                break;
            case "시간전":
                reviewDateTime = new Date().getTime() - new Date(0).setHours(Number(textArr[0]));
                break;
            case "일전":
                reviewDateTime = new Date().getTime() - new Date(0).setDate(Number(textArr[0]));
                break;
        }
        ymd = new Date(reviewDateTime).toISOString();
    }

    return ymd;
}
