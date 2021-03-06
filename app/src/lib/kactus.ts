import * as Fs from 'fs'
import * as Path from 'path'
import { exec } from 'child_process'
import { IKactusStatusResult, find } from 'kactus-cli'
import { Repository } from '../models/repository'
import { Account } from '../models/account'
import { getDotComAPIEndpoint } from './api'

const SKETCHTOOL_PATH =
  '/Applications/Sketch.app/Contents/Resources/sketchtool/bin/sketchtool'

/**
 *  Retrieve the status for a given repository
 */
export async function getKactusStatus(
  repository: Repository
): Promise<IKactusStatusResult> {
  return Promise.resolve().then(() => {
    const kactus = find(repository.path)
    return {
      config: kactus.config,
      files: kactus.files.map(f => {
        return {
          ...f,
          id: f.path.replace(repository.path, '').replace(/^\//, ''),
        }
      }),
    }
  })
}

export async function generateDocumentPreview(
  file: string,
  output: string
): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    exec(
      SKETCHTOOL_PATH +
        ' export preview "' +
        file +
        '" --output="' +
        output +
        '" --filename=document.png --overwriting=YES',
      (err, stdout, stderr) => {
        if (err) {
          return reject(err)
        }
        resolve(output + '/document.png')
      }
    )
  })
}

export async function generatePagePreview(
  file: string,
  name: string,
  output: string
): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    exec(
      SKETCHTOOL_PATH +
        ' export pages "' +
        file +
        '" --item="' +
        name +
        '" --output="' +
        output +
        '" --save-for-web=YES --use-id-for-name=YES --overwriting=YES',
      (err, stdout, stderr) => {
        if (err) {
          return reject(err)
        }
        const id = stdout.replace('Exported', '').trim()
        resolve(output + '/' + id)
      }
    )
  })
}

export async function generateArtboardPreview(
  file: string,
  id: string,
  output: string
): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    exec(
      SKETCHTOOL_PATH +
        ' export artboards "' +
        file +
        '" --item="' +
        id +
        '" --output="' +
        output +
        '" --save-for-web=YES --use-id-for-name=YES --overwriting=YES --include-symbols=YES',
      (err, stdout, stderr) => {
        if (err) {
          return reject(err)
        }
        resolve(output + '/' + id + '.png')
      }
    )
  })
}

export async function generateLayerPreview(
  file: string,
  id: string,
  output: string
): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    exec(
      SKETCHTOOL_PATH +
        ' export layers "' +
        file +
        '" --item="' +
        id +
        '" --output="' +
        output +
        '" --save-for-web=YES --use-id-for-name=YES --overwriting=YES',
      (err, stdout, stderr) => {
        if (err) {
          return reject(err)
        }
        resolve(output + '/' + id + '.png')
      }
    )
  })
}

export async function saveKactusConfig(
  repository: Repository,
  content: string
): Promise<void> {
  const configPath = Path.join(repository.path, 'kactus.json')

  return new Promise<void>((resolve, reject) => {
    Fs.writeFile(configPath, content, err => {
      if (err) {
        reject(err)
      } else {
        resolve()
      }
    })
  })
}

export function shouldShowPremiumUpsell(
  repository: Repository,
  account: Account | null
) {
  if (
    repository.gitHubRepository &&
    account &&
    account.endpoint !== getDotComAPIEndpoint() &&
    !account.unlockedKactus
  ) {
    return { enterprise: true }
  }

  if (
    repository.gitHubRepository &&
    repository.gitHubRepository.private &&
    account &&
    !account.unlockedKactus
  ) {
    return { enterprise: false }
  }

  return false
}
