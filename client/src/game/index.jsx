import { useEffect } from "react";
import "./TemplateData/style.css";
import { useState } from "react";
import localData from './../assets/localData.json' //展示的本地数据
import localModelData from './../assets/localModelData.json' //展示模型的本地数据
import './App.css';
import axios from 'axios';
import img1 from './../img/0072.gif';
import loading from './../img/17a4cbaaf21bd116233a31fd05b2aa0.png';
import icon from "../img/smallloading.png";
import { Progress, Row, Col } from 'antd';

//=============================================自定义接口==========================================================
const defaultWsServerUrl="wss://kverso.com/socket/"; //默认的websocket url
const getWsServerUrl= "https://kverso.com/galleryapi/wsserver"; //获得websocket的api地址
const getGalleryListUrl = "https://kverso.com/galleryapi/gallerylist"; //获得gallery展品list的api地址
const canGalleryUpdate = false; //gallery中的展品 是否实时更新
const galleryUpdateInterval = 300; //gallery中的展品 更新间隔 该更新间隔不宜设置过小 因为在web中只能允许单线程下载，过于频繁的更新会导致博物馆的整个游览流程卡顿
const downloadInterval = 2;//gallery图片的单图刷新间隔时间 单位秒 这里的间隔如果较短，则会在刚进入场馆时卡顿，加载全量数据，否则会逐步缓慢更新。 建议设置为2秒以上
//=============================================自定义接口==========================================================

export default () => {
  const [show, setShow] = useState(0);
  const [percent, setPercent] = useState(38.2);
  const [length,setLength]=useState();
  var percentshow = document.getElementById('percentshow');
  const callback = (progress) => {
    console.log(progress)
    setShow(Math.floor(progress));
  }


  let isInit = false;

  useEffect(() => {
    var localJson = JSON.stringify(localData)
    var localModelJson = JSON.stringify(localModelData)

    if (isInit) return;
    isInit = true;
    var container = document.querySelector("#unity-container");
    var main = document.getElementById('main');
    var canvas = document.querySelector("#unity-canvas");
    var loadingBar = document.querySelector("#unity-loading-bar");
    var progressBarFull = document.querySelector("#unity-progress-bar-full");
    var fullscreenButton = document.querySelector("#unity-fullscreen-button");
    var warningBanner = document.querySelector("#unity-warning");

    // Shows a temporary message banner/ribbon for a few seconds, or
    // a permanent error message on top of the canvas if type==='error'.
    // If type==='warning', a yellow highlight color is used.
    // Modify or remove this function to customize the visually presented
    // way that non-critical warnings and error messages are presented to the
    // user.
    function unityShowBanner(msg, type) {
      function updateBannerVisibility() {
        warningBanner.style.display = warningBanner.children.length
          ? "block"
          : "none";
      }
      var div = document.createElement("div");
      div.innerHTML = msg;
      warningBanner.appendChild(div);
      if (type === "error") div.style = "background: red; padding: 10px;";
      else {
        if (type === "warning") div.style = "background: yellow; padding: 10px;";
        setTimeout(function () {
          warningBanner.removeChild(div);
          updateBannerVisibility();
        }, 5000);
      }
      updateBannerVisibility();
    }

    //Unity的加载配置
    var buildUrl = "Build";
    var loaderUrl = buildUrl + "/Build.loader.js";
    var config = {
      dataUrl: buildUrl + "/Build.data.unityweb",
      frameworkUrl: buildUrl + "/Build.framework.js.unityweb",
      codeUrl: buildUrl + "/Build.wasm.unityweb",
      streamingAssetsUrl: "StreamingAssets",
      companyName: "Kverso",
      productName: "Gallery",
      productVersion: "1.0",
      showBanner: unityShowBanner,
    };

    // By default Unity keeps WebGL canvas render target size matched with
    // the DOM size of the canvas element (scaled by window.devicePixelRatio)
    // Set this to false if you want to decouple this synchronization from
    // happening inside the engine, and you would instead like to size up
    // the canvas DOM size and WebGL render target sizes yourself.
    // config.matchWebGLToCanvasSize = false;
    if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
      container.className = "unity-mobile";
      // Avoid draining fillrate performance on mobile devices,
      // and default/override low DPI mode on mobile browsers.
      config.devicePixelRatio = 1;
      unityShowBanner("WebGL builds are not supported on mobile devices.");
    } else {
      canvas.style.width = "100vw";
      canvas.style.height = "100vh";
    }
    loadingBar.style.display = "block";

    var script = document.createElement("script");
    let instance = null;
    script.src = loaderUrl;

    //加载游戏资源
    script.onload = () => {
      let createUnityInstance = window.createUnityInstance || null;
      //创建Unity单例
      createUnityInstance(canvas, config, (progress) => {
        progressBarFull.style.width = 100 * progress + "%";
        callback((progress) * 100);
      })
        .then((unityInstance) => {
          axios.get(getWsServerUrl)
            .then((res) => {
              if (res.data.url.indexOf("wss") == 0) {
                console.log(res.data.url)
                unityInstance.SendMessage("JSCall", "WebsocketServer", res.data.url)
              }
              else {

                unityInstance.SendMessage("JSCall", "WebsocketServer", defaultWsServerUrl)
              }
            })
            .catch((err) => {
              unityInstance.SendMessage("JSCall", "WebsocketServer", defaultWsServerUrl)
            })
          
          //请求获取websocekt的url 如果取到了 则直接返回 如果没取到则返回默认的websocekt url 该请求是可以放在任何地方
          //本地资源列表 json内置 在加载完成后 第一时间返回给unity 
          //让Unity加载本地图片列表
          unityInstance.SendMessage("JSCall", "GalleryListLocal", localJson)
          //让Unity加载模型信息列表
          unityInstance.SendMessage("JSCall","ModelGalleryList",localModelJson)
          unityInstance.SendMessage("JSCall", "DownLoadInterval", downloadInterval.toString())
          //在这发
          //获取网络资源列表 只要在加载完成之后 发给unity即可 验证数据 列表每个位置的个数 url path list 网络的个数要小于等于本地的个数 
          function getGalleryList()
          {
            axios.get(getGalleryListUrl)
            .then((res) => {
              unityInstance.SendMessage("JSCall", "GalleryList", res.data.data)
              // console.log(res.data.data)
            })
            .catch((err) => {
              console.log(err)
            })
          }
          
          setTimeout(()=>{getGalleryList()},1000);
          if(canGalleryUpdate)
          {
            setInterval(()=>{
              getGalleryList();
            },galleryUpdateInterval * 1000)
          }
          
          main.style.display = "none";
          loadingBar.style.display = "none";
          instance = unityInstance;
          fullscreenButton.onclick = () => {
            unityInstance.SetFullscreen(1);
          };
        })
        .catch((message) => {
          alert(message);
        });
    };
    document.body.appendChild(script);


    return (() => {
      // document.querySelector("#root").style.overflow="unset";
      document.body.parentNode.style.overflowY = "unset"
    })
  }, []);
  return (
    <div>
      <div id="unity-container" className="unity-desktop" >
        <canvas id="unity-canvas" width="100vw" height="100vh" />
        <div id="unity-loading-bar">
          <div id="unity-logo" />
          <div id="unity-progress-bar-empty">
            <div id="unity-progress-bar-full" />
          </div>
        </div>
        <div id="unity-warning"> </div>
        <div id="unity-footer">
          {/* <div id="unity-webgl-logo"></div> */}
          <div id="unity-fullscreen-button" style={{ width: 0, height: 0 }} />
          {/* <div id="unity-build-title">GenerateMap</div> */}
        </div>
      </div>
      <Row>
        <div className='main' id="main" >
          <Row className='img1' >
            <Col span={24} className='img_child2'><img src={img1} alt="" className='img_logo' /></Col>
          </Row>
          <img src={loading} alt="" className='loading' />
          <Row className='progress_box'>
            <div className="" >

              <img src={icon} style={{ paddingLeft: `calc(${percent * (show / 100)}%)` }} className='icon'></img>
              <Progress
                strokeWidth={25}
                strokeColor='
                #17e6a1'
                percent={show}
                style={{ width: `${percent}vw` }}
                // showInfo={show===100?false:true}
                showInfo={false}
              />

            </div>
          </Row>
          {/* <Row>
          <span className='percentShow' id="percentshow"><b>{`${show}%`}</b></span>
          </Row> */}
        </div>
      </Row>
    </div>
  );
};
