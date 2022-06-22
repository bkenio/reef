import Ffmpeg from 'fluent-ffmpeg'
import { spawn } from 'child_process'
import { Progress, FFmpegArgs } from '../types'

export function spawnFFmpeg(commands: string, tmpDir: string) {
  return new Promise((resolve, reject) => {
    const proc = spawn('ffmpeg', commands.split(' '), { cwd: tmpDir })
    proc.stdout.on('data', function (data) {
      console.log('ffmpeg:stdout', data)
    })
    proc.stderr.setEncoding('utf8')
    proc.stderr.on('data', function (data) {
      console.log('ffmpeg:stderr', data)
      if (data.toLowerCase().includes('error')) reject(data)
    })
    proc.on('close', function () {
      console.log('ffmpeg closing')
      resolve('completed')
    })
  })
}

// TODO :: Deprecate fluent-ffmpeg
export async function ffmpeg({ input, commands, output, job }: FFmpegArgs): Promise<string> {
  return new Promise((resolve, reject) => {
    let lastProgress = 0
    Ffmpeg(input)
      .outputOptions(commands)
      .output(output)
      .on('start', function (commandLine) {
        console.log('Spawned ffmpeg with command: ' + commandLine)
      })
      .on('progress', async function (progress: Progress) {
        if (progress.percent >= 0) {
          const currentProgress = Math.floor(progress.percent)
          if (lastProgress !== currentProgress) {
            if (job) await job.updateProgress(currentProgress)
          }
          lastProgress = Math.ceil(progress.percent)
        }
      })
      .on('error', function (err) {
        console.log('An error occurred: ' + err.message)
        reject(err.message)
      })
      .on('end', async function () {
        if (job) await job.updateProgress(100)
        console.log('Done')
        resolve(output)
      })
      .run()
  })
}
