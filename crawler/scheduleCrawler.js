const {Builder, By, Key, until, Capabilities} = require('selenium-webdriver');
const { getJsonData, appendDataInJson } = require('./fileWriter');

const getLink = (aname, a, t, d) => {
    return `http://www.cgv.co.kr/common/showtimes/iframeTheater.aspx?${aname}=${a}&theatercode=${t}&date=${d}`;
}

(async function example() {
    // let driver = await new Builder().forBrowser('chrome').build();
    const chrome = require('selenium-webdriver/chrome');
    const chromedriver = require('chromedriver');

    chrome.setDefaultService(new chrome.ServiceBuilder(chromedriver.path).build());
    var driver = new Builder().withCapabilities(Capabilities.chrome()).build();

    try {
        // let areaData = await getJsonData("area.json");
        await driver.get(getLink("areacode", "01", "0056", "20210610")); 
        
        let theaterData = await getJsonData("theater.json");
        theaterData.forEach((v,i) => {
            let codeName = Object.keys(v)[0];
            let code = v.areacode || v.regioncode;
            await driver.get(getLink(codeName, code, v.theaterData, "20210610"));
            let dayViews = await driver.findElements(By.css(".day > a > strong"));
           
        });
        // console.log(theaterData);
        await driver.get(getLink("01", "0056", "20210610")); // regioncode  areacode
        await driver.sleep(1000);
        await driver.get(getLink("01", "0056", "20210609"));

    }
    finally{
        // driver.quit(); 
    }
})();
