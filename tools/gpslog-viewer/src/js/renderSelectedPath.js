(() => {
  /**
   * renderNode
   */
  const renderNode = (node, map) => {
    const zoom = map.getZoom()
    const zoomScale = map.getZoomScale(zoom, 15)
    const radius = zoom <= 15 ? 18 : 18 / zoomScale
    node.setRadius(radius)
  }

  /**
   * render selected path
   */
  const renderSelectedPath = () => {
    const { L, proj4, arukimoji } = window
    const EPSG3857 = proj4('EPSG:3857')
    const WGS84 = proj4('WGS84')
    const { map, pointLayer, selectedPath, exportControl, emBoxLayer } = arukimoji
    const bounds = L.latLngBounds()
    const exportControlContainer = exportControl.getContainer()

    // clear
    pointLayer.clearLayers()
    emBoxLayer.clearLayers()

    // render
    selectedPath
      .forEach(({feature, path}) => {
        // render outline
        const latLngs = path.getLatLngs()
        L.polyline(latLngs, {color: '#00f', weight: 1}).addTo(pointLayer)

        // render point
        latLngs
          .forEach((point, index) => {
            const coordTime = new Date(feature.properties.coordTimes[index]).toLocaleString()
            const node = L.circle(point, {
              radius: 5,
              stroke: false,
              fillOpacity: 1,
              color: '#00f'
            })

            // create node
            node.bindTooltip(`<b>${index}</b> of ${feature.properties.name}<br>${point.lat}, ${point.lng}<br>${coordTime}`)
              .addTo(pointLayer)
              .bringToFront()
            node.arukimojiRenderNode = () => { renderNode(node, map) }
            node.arukimojiRenderNode()
          })

        bounds.extend(path.getBounds())
      })

    if (selectedPath.length > 0) {
      // emBox
      const ne = bounds.getNorthWest()
      const sw = bounds.getSouthEast()
      let [ xMin, yMax ] = proj4(EPSG3857, [ne.lng, ne.lat])
      let [ xMax, yMin ] = proj4(EPSG3857, [sw.lng, sw.lat])
      let [ width, height ] = [ xMax - xMin, yMax - yMin ]
      const delta = Math.abs(width - height) / 2
      if (height > width) {
        xMin -= delta
        xMax += delta
      } else {
        yMin -= delta
        yMax += delta
      }
      [ width, height ] = [ xMax - xMin, yMax - yMin ]
      const emBoxNe = proj4(EPSG3857, WGS84, {x: xMin, y: yMax})
      const emBoxSw = proj4(EPSG3857, WGS84, {x: xMax, y: yMin})
      let emBox = L.latLngBounds(
        L.latLng(emBoxNe.y, emBoxNe.x),
        L.latLng(emBoxSw.y, emBoxSw.x)
      )
      emBox = emBox.pad(0.111111111)
      window.arukimoji.emBox = emBox
      console.log(emBox)

      // emBoxRect
      L.rectangle(emBox, {
        weight: 1
      })
        .addTo(emBoxLayer)
        .bringToBack()

      // fit emBox
      map.fitBounds(emBox)

      // enable export control
      exportControlContainer
        .classList
        .remove('leaflet-control-select--disable')
    } else {
      exportControlContainer
        .classList
        .add('leaflet-control-select--disable')
    }
  }

  window.renderSelectedPath = renderSelectedPath
})()
