declare module 'execa-output' {
  import Execa from 'execa'
  export = Execa
  // TODO: need ExecaoChildProcess(return Observable Type)
}

declare module '@samverschueren/stream-to-observable' {
  import { Readable } from 'stream'
  import { Observable } from 'rxjs/index'

  export = streamToObservable
  function streamToObservable(
    stream: Readable,
    opts?: {
      await?: Promise<any>
      endEvent?: string | false
      errorEvent?: string | false
      dataEvent?: string
    }
  ): Observable<any>
}
