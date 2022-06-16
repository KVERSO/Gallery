import React, { useState, useEffect } from 'react';
import './App.css'
import img1 from './../img/GIFLOGO.gif'
import loading from './../img/17a4cbaaf21bd116233a31fd05b2aa0.png'
import icon from "../img/a363874b409388d3b06def67083c26d.png"
import { Progress, Row, Col } from 'antd';
// let callback = nil;
export default () => {
  const [show, setShow] = useState(0);
  const [percent, setPercent] = useState(36);
  console.log(show);
      useEffect(() => {
        let _progress = 0;
        let timerId = setInterval(() => {
            setShow(_progress);
            if (_progress === 100) {
                clearInterval(timerId);
                // window.location.href = 'http://www.baidu.com';
            }
            _progress += Math.floor(Math.random() * 5);//随机数
            if (_progress > 100) {
                _progress = 100;
            }
        }, 100);
      return () => {
          timerId && clearInterval(timerId);
      }
      
  }, [])
 
//  callback()
  return (<Row>
    <div className='main'>
      <Row className='img1' >
        <Col span={24} className='img_child2'><img src={img1} alt="" className='img_logo' /></Col>
      </Row>
        <img src={loading} alt="" className='loading'  />
      <Row className='progress_box'>
        <div>
        {show>=30&&<span className='percentShow' style={{ paddingLeft: `${(percent-3.8)*(show/100)}vw` }}><b>{`${show}%`}</b></span>}
          <img src={icon} style={{ paddingLeft: `${(percent+0.5)*(show/100)}vw` }} className='icon'></img>
          <Progress
            strokeWidth={25}
            strokeColor='
            #94E1C5'
            percent={show}
            style={{ width: `${percent}vw` }}
            // showInfo={show===100?false:true}
            showInfo={false}
          />
          
        </div>
      </Row>

    </div>
  </Row>
  )
};