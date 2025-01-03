import axios from 'axios';
const axiosCall = async (data) => {
  try {
    const config = {
      method: 'post',
      url: process.env.SERVICE_REQ_RES + ':' + process.env.SERVICE_REQ_RES_PORT,
      data: data,
    };

    const result = await axios(config);
    console.log(result);
  } catch (err) {
    console.log(err);
  }
};

const logData = async (req, data) => {
  console.log(data);
  let params;
  if (Object.keys(req.params).length !== 0) {
    params = req.params;
  } else if (Object.keys(req.query).length !== 0) {
    params = req.query;
  } else if (Object.keys(req.body).length !== 0) {
    params = req.body;
  }
  const dataForAxios = {
    param: params,
    method: req.method,
    originalURL: req.originalUrl,
    port: process.env.SELF_MICROSERVICE_HOST,
    server: process.env.SERVICE_BASE_URL,
    header:req.headers,
    serviceName:process.env.MICROSERVICE_NAME,
    response: JSON.stringify(data),
  };
  await axiosCall(dataForAxios);
};

export const CustomInterceptor = (req, res, next) => {
  const oldSend = res.send;
  res.send = (data) => {
    logData(req, data);
    res.send = oldSend;
    return res.send(data);
  };
  // if (next)
  next();
};
