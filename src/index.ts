import { Plugin } from 'rollup'
import Listr, { ListrTask, ListrOptions } from 'listr'
import execa, {
  Options as ExecaOptions,
  SyncOptions as ExecaSyncOptions,
  ExecaError
} from 'execa'
import split from 'split'
import { merge, throwError } from 'rxjs'
import { filter, catchError } from 'rxjs/operators'
import streamToObservable from '@samverschueren/stream-to-observable'

import { isStringArray } from './libs/validator'

type Options = typeof defaultOptions
const defaultOptions = {
  concurrent: false as ListrOptions['concurrent']
}

const mergeOptions = (options: Options) => ({
  ...defaultOptions,
  ...options
})

//// TODO: implement perfect Observable execute & error handling
////
const exec = (
  command: string,
  args: ReadonlyArray<string>,
  options?: ExecaOptions | ExecaSyncOptions
) => {
  // Use `Observable` support if merged https://github.com/sindresorhus/execa/pull/26
  const cp = execa(command, args, options)

  return merge(
    streamToObservable(cp.stdout.pipe(split()), {
      await: cp
    }),
    streamToObservable(cp.stderr.pipe(split()), { await: cp })
  ).pipe(filter(Boolean))
}

const handleCommands = (commands: string[]) => {
  const separateCmdAndArgs = (command: string) => {
    const [cmd, ...args] = command.split(' ')
    return { cmd, args }
  }

  return commands.map(command => ({
    title: command,
    ...separateCmdAndArgs(command)
  }))
}

const createTasks = (commands: string[], options: Options) => {
  const parsedCommands = handleCommands(commands)
  const { concurrent } = options

  const tasks: ListrTask[] = parsedCommands.map(
    ({ title, cmd, args }): ListrTask => ({
      title,
      task: () =>
        exec(cmd, args).pipe(
          catchError<ExecaError, never>((error: ExecaError) =>
            throwError(error)
          )
        ) as any // TODO: add Observable type to ListrTask typing
    })
  )
  return new Listr(tasks, { concurrent })
}

const execute = (
  commands: string | string[],
  options: Options = defaultOptions
): Plugin => {
  options = mergeOptions(options)

  // convert: string to string[]
  if (typeof commands === 'string') commands = [commands]

  return {
    name: 'pre-execute',
    async load(id) {
      // Guard: is string[] format?
      if (!Array.isArray(commands) || !isStringArray(commands)) {
        throw new Error('Commands should be a string or stringArray(string[])')
      }
      /**
       * @description
       * Guard:
       * ignore IDs with null character, these belong to other plugins(e.g. rollup-plugin-babel)
       * @see
       * https://rollupjs.org/guide/en#conventions
       */
      if (/\0/.test(id)) return null

      const tasks = createTasks(commands, options)

      await tasks.run().catch((error: ExecaError) => {
        console.error(error.stdout)
        this.error(error.stderr)
      })

      return null
    }
  }
}

export default execute
