import * as React from 'react'

import { ImageDiffType } from '../../lib/app-state'
import { Image } from '../../models/diff'
import { renderImage } from './render-image'
import { TabBar } from '../tab-bar'

interface IModifiedImageDiffProps {
  readonly previous: Image
  readonly current: Image
  readonly diffType: ImageDiffType
  readonly onChangeDiffType: (type: number) => void
}

const getDimensions = (
  naturalHeight: number | null,
  naturalWidth: number | null
) => {
  const heightRatio = 1
  const widthRatio = 1

  // Use max to prevent scaling up the image
  let divisor = Math.max(1, widthRatio)
  if (widthRatio < heightRatio) {
    // fit to height
    divisor = Math.max(1, heightRatio)
  }

  return {
    width: (naturalWidth || 0) / divisor,
    height: (naturalHeight || 0) / divisor,
  }
}

/** A component which renders the changes to an image in the repository */
export class ModifiedImageDiff extends React.Component<
  IModifiedImageDiffProps,
  {
    value: number
    naturalWidthBefore: number | null
    naturalHeightBefore: number | null
    naturalWidthAfter: number | null
    naturalHeightAfter: number | null
  }
> {
  private _container: HTMLDivElement | null

  public constructor(props: IModifiedImageDiffProps) {
    super(props)
    this.state = {
      value: 1,
      naturalWidthBefore: null,
      naturalHeightBefore: null,
      naturalWidthAfter: null,
      naturalHeightAfter: null,
    }
  }

  private handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({
      value: parseFloat(e.currentTarget.value),
    })
  }

  private handleImgLoadBefore = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { naturalHeight, naturalWidth } = e.target as HTMLImageElement
    this.setState({
      naturalHeightBefore: naturalHeight,
      naturalWidthBefore: naturalWidth,
    })
  }

  private handleImgLoadAfter = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { naturalHeight, naturalWidth } = e.target as HTMLImageElement
    this.setState({
      naturalHeightAfter: naturalHeight,
      naturalWidthAfter: naturalWidth,
    })
  }

  private getScaledDimensions() {
    const {
      naturalWidthBefore,
      naturalHeightBefore,
      naturalWidthAfter,
      naturalHeightAfter,
    } = this.state

    let height = 0
    let width = 0
    let heightBefore = 0
    let widthBefore = 0
    let heightAfter = 0
    let widthAfter = 0

    if (naturalHeightBefore && naturalHeightAfter) {
      const before = getDimensions(naturalHeightBefore, naturalWidthBefore)
      heightBefore = before.height
      widthBefore = before.width
      const after = getDimensions(naturalHeightAfter, naturalWidthAfter)
      heightAfter = after.height
      widthAfter = after.width

      height = Math.max(heightBefore, heightAfter)
      width = Math.max(widthBefore, widthAfter)
    }

    return {
      height,
      width,
      heightBefore,
      widthBefore,
      heightAfter,
      widthAfter,
      widthContainer:
        (this._container && this._container.getBoundingClientRect().width) || 0,
    }
  }

  private onContainerRef = (c: HTMLDivElement | null) => {
    this._container = c
  }

  public render() {
    const { height, width, widthContainer } = this.getScaledDimensions()
    return (
      <div className="panel image" id="diff" ref={this.onContainerRef}>
        {this.props.diffType === ImageDiffType.TwoUp &&
          this.render2Up(height, width, widthContainer)}
        {this.props.diffType === ImageDiffType.Swipe &&
          this.renderSwipe(height, width, widthContainer)}
        {this.props.diffType === ImageDiffType.OnionSkin &&
          this.renderFade(height, width, widthContainer)}
        {this.props.diffType === ImageDiffType.Difference &&
          this.renderDifference(height, width, widthContainer)}
        <TabBar
          selectedIndex={this.props.diffType}
          onTabClicked={this.props.onChangeDiffType}
          type="switch"
        >
          <span>2-up</span>
          <span>Swipe</span>
          <span>Onion Skin</span>
          <span>Difference</span>
        </TabBar>
      </div>
    )
  }

  private render2Up(height: number, width: number, widthContainer: number) {
    return (
      <div className="image-diff_inner--two-up">
        <div className="image-diff__before">
          <div className="image-diff__header">Deleted</div>
          {renderImage(this.props.previous, {
            onLoad: this.handleImgLoadBefore,
            style: {
              maxHeight: height,
              maxWidth: Math.min(width, (widthContainer - 15) / 2),
            },
          })}
          <div className="image-diff__footer">
            <span className="strong">W:</span> {this.state.naturalWidthBefore}px
            | <span className="strong">H:</span>{' '}
            {this.state.naturalHeightBefore}px
          </div>
        </div>
        <div className="image-diff__after">
          <div className="image-diff__header">Added</div>
          {renderImage(this.props.current, {
            onLoad: this.handleImgLoadAfter,
            style: {
              maxHeight: height,
              maxWidth: Math.min(width, (widthContainer - 15) / 2),
            },
          })}
          <div className="image-diff__footer">
            <span className="strong">W:</span> {this.state.naturalWidthAfter}px
            | <span className="strong">H:</span> {this.state.naturalHeightAfter}px
          </div>
        </div>
      </div>
    )
  }

  private renderDifference(
    height: number,
    width: number,
    widthContainer: number
  ) {
    return (
      <div
        className="image-diff_inner--difference"
        style={{
          height,
          width,
          left: (widthContainer - width) / 2,
        }}
      >
        <div className="image-diff__before">
          {renderImage(this.props.previous, {
            onLoad: this.handleImgLoadBefore,
            style: {
              maxHeight: height,
              maxWidth: width,
            },
          })}
        </div>
        <div className="image-diff__after">
          {renderImage(this.props.current, {
            onLoad: this.handleImgLoadAfter,
            style: {
              maxHeight: height,
              maxWidth: width,
              mixBlendMode: 'difference',
            },
          })}
        </div>
      </div>
    )
  }

  private renderFade(height: number, width: number, widthContainer: number) {
    const style = {
      height,
      width,
    }
    return (
      <div
        className="image-diff_inner--fade"
        style={{
          ...style,
          marginBottom: 30,
          left: (widthContainer - width) / 2,
        }}
      >
        <div className="image-diff__before" style={style}>
          {renderImage(this.props.previous, {
            onLoad: this.handleImgLoadBefore,
            style: {
              maxHeight: height,
              maxWidth: width,
            },
          })}
        </div>
        <div
          className="image-diff__after"
          style={{
            ...style,
            opacity: this.state.value,
          }}
        >
          {renderImage(this.props.current, {
            onLoad: this.handleImgLoadAfter,
            style: {
              maxHeight: height,
              maxWidth: width,
            },
          })}
        </div>
        <input
          style={{ margin: `${height + 10}px 0 0 ${(width - 129) / 2}px` }}
          type="range"
          max={1}
          min={0}
          value={this.state.value}
          step={0.001}
          onChange={this.handleValueChange}
        />
      </div>
    )
  }

  private renderSwipe(height: number, width: number, widthContainer: number) {
    const style = {
      height,
      width,
    }
    return (
      <div
        className="image-diff_inner--swipe"
        style={{
          ...style,
          marginBottom: 30,
          left: (widthContainer - width) / 2,
        }}
      >
        <div className="image-diff__after" style={style}>
          {renderImage(this.props.current, {
            onLoad: this.handleImgLoadAfter,
            style: {
              maxHeight: height,
              maxWidth: width,
            },
          })}
        </div>
        <div
          className="image-diff--swiper"
          style={{
            width: width * (1 - this.state.value),
            height: height + 10,
          }}
        >
          <div className="image-diff__before" style={style}>
            {renderImage(this.props.previous, {
              onLoad: this.handleImgLoadBefore,
              style: {
                maxHeight: height,
                maxWidth: width,
              },
            })}
          </div>
        </div>
        <input
          style={{ margin: `${height + 10}px 0 0 -7px`, width: width + 14 }}
          type="range"
          max={1}
          min={0}
          value={this.state.value}
          step={0.001}
          onChange={this.handleValueChange}
        />
      </div>
    )
  }
}
