import { Plugin } from 'rollup'
import execa from 'execa'
import { forEach, forEachSeries } from 'p-iteration'

import { isStringArray } from './libs/validator'

type Options = typeof defaultOptions
const defaultOptions = {
  runMode: 'sequential' as 'sequential' | 'parallel'
}

const mergeOptions = (options: Options) => ({
  ...defaultOptions,
  ...options
})

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
      if (/\0/.test(id)) return null // ignore IDs with null character, these belong to other plugins(e.g. rollup-plugin-babel)

      console.log('Executing command(s)')

      try {
        if (options.runMode === 'sequential') {
          await forEachSeries(
            commands,
            async command => await execa.shellSync(command)
          )
        }

        if (options.runMode === 'parallel') {
          await forEach(commands, async command => await execa.shell(command))
        }
      } catch (error) {
        console.error(error)
        throw new Error(error)
      }

      return null
    }
  }
}

export default execute
