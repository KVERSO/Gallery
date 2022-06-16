import React ,{useState}from 'react';
import './App.css'
import img1 from './img/e1ff0306345f7f99397d03b3d20b81a.png';
import img2 from './img/a363874b409388d3b06def67083c26d.png';
import { Progress,Row,Col } from 'antd';

export default () => {
  const [show, setShow] = useState(false)
  return(<Row>
    <div className='main'>
      {/* <div className='img1'> */}
        <Row className='img1' >
        <Col span={6} className='img_child1'></Col>
        <Col span={18} className='img_child2'><img src={img1} alt="" className='aaa' /></Col>
        </Row>
      {/* </div> */}
      {/* <div className='progress_box' > */}
        <Row className='progress_box' >
        <div>
        <Progress className='progress' status="active" strokeColor={'#94E1C5'} percent={100} width={10} strokeWidth={55} />
        </div>
        </Row>
      {/* </div> */}
    </div>
    </Row>
    )
};