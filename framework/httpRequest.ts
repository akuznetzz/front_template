import {AxiosInstance, AxiosRequestConfig} from 'axios';

export const HTTP_ERROR: string = 'httpRequestError';
export const VALIDATION_ERROR: string = 'ValidationError';
export const HTTP_200_OK = 200;
const MESSAGE_SERVER_ERROR: string = 'При обращении к серверу произошла ошибка. Ниже приводятся технические детали.\n';
const RECORD_NOT_FOUND_OR_DELETED: string = 'Запись не найдена или удалена.\n';
const NOT_FOUND: number = 404;
const INTERNAL_SERVER_ERROR: number = 500;

function axios(): AxiosInstance {
  // @ts-ignore
  return window.$nuxt.$axios;
}

function isHttpError(statusCode: number): boolean {
  return statusCode >= 400;
}

export async function httpPost(url: string, data?: any, config?: AxiosRequestConfig): Promise<any> {
  return checkResponse(await axios().post(url, data, config));
}

export async function httpPut(url: string, data?: any, config?: AxiosRequestConfig): Promise<any> {
  return checkResponse(await axios().put(url, data, config));
}

export async function httpGet(url: string, config?: AxiosRequestConfig): Promise<any> {
  return checkResponse(await axios().get(url, config));
}

export async function httpDelete(url: string, config?: AxiosRequestConfig): Promise<any> {
  return checkResponse(await axios().delete(url, config));
}

export async function httpPatch(url: string, data?: any, config?: AxiosRequestConfig): Promise<any> {
  return checkResponse(await axios().patch(url, data, config));
}

export async function httpOptions(url: string) {
  return checkResponse(await axios().options(url));
}

class HttpError extends Error {
  responseCode?: number;

  constructor(message: string, responseCode?: number) {
    super(message);
    this.name = HTTP_ERROR;
    this.responseCode = responseCode;
  }
}

class ServerValidationError extends Error {
  constructor(message: string) {
    super(message.match(/\[(.*?)\]/)![1] || message);
    this.name = VALIDATION_ERROR;
  }
}

function checkResponse(response: any) {
  if (isHttpError(response.status)) {
    if (response.data && typeof response.data === 'object') {
      if (<boolean>response.data.detail) {
        throw new HttpError(`${response.data.detail}`, response.status);
      }
      response.data = JSON.stringify(response.data);
    }
    if (response.status === NOT_FOUND) {
      throw new HttpError(`${RECORD_NOT_FOUND_OR_DELETED} ${response.status}: ${response.data}`, response.status);
    } else if (response.status === INTERNAL_SERVER_ERROR && response.data.includes(VALIDATION_ERROR)) {
      throw new ServerValidationError(response.data);
    } else {
      throw new HttpError(`${MESSAGE_SERVER_ERROR} ${response.status}: ${response.data}`, response.status);
    }
  }
  return response;
}
