import * as React from 'react'
import { Diff } from '../diff'
import { ChangedFileDetails } from './changed-file-details'
import { SketchFileView } from './sketch-file-view'
import { DiffSelection, IDiff } from '../../models/diff'
import { WorkingDirectoryFileChange } from '../../models/status'
import { Repository } from '../../models/repository'
import { Dispatcher } from '../../lib/dispatcher'
import { IKactusFile } from 'kactus-cli'

// At some point we'll make index.tsx only be exports
// see https://github.com/desktop/desktop/issues/383
export { ChangesSidebar } from './sidebar'

interface IChangesProps {
  readonly repository: Repository
  readonly sketchFile: IKactusFile | null
  readonly file: WorkingDirectoryFileChange | null
  readonly diff: IDiff | null
  readonly dispatcher: Dispatcher
  readonly showAdvancedDiffs: boolean
  readonly isImporting: boolean
  readonly isParsing: boolean
  readonly imageDiffType: number
}

export class Changes extends React.Component<IChangesProps, {}> {
  private onDiffLineIncludeChanged = (diffSelection: DiffSelection) => {
    const file = this.props.file
    this.props.dispatcher.changeFileLineSelection(
      this.props.repository,
      file!,
      diffSelection
    )
  }

  private onSketchParse = (path: string) => {
    this.props.dispatcher.parseSketchFile(this.props.repository, path)
  }

  private onSketchImport = (path: string) => {
    this.props.dispatcher.importSketchFile(this.props.repository, path)
  }

  private onOpenSketchFile = (path: string) => {
    this.props.dispatcher.openSketchFile(path)
  }

  public render() {
    const diff = this.props.diff
    const file = this.props.file
    const sketchFile = this.props.sketchFile

    if (sketchFile) {
      return (
        <SketchFileView
          isParsing={this.props.isParsing}
          isImporting={this.props.isImporting}
          sketchFile={sketchFile}
          onExport={this.onSketchParse}
          onImport={this.onSketchImport}
          onOpenSketchFile={this.onOpenSketchFile}
        />
      )
    }

    if (file && diff) {
      return (
        <div className="changed-file">
          <ChangedFileDetails
            path={file.path}
            oldPath={file.oldPath}
            status={file.status}
            diff={diff}
          />

          <div className="diff-wrapper">
            <Diff
              repository={this.props.repository}
              imageDiffType={this.props.imageDiffType}
              showAdvancedDiffs={this.props.showAdvancedDiffs}
              file={file}
              readOnly={false}
              onIncludeChanged={this.onDiffLineIncludeChanged}
              diff={diff}
              dispatcher={this.props.dispatcher}
            />
          </div>
        </div>
      )
    }

    return null
  }
}
