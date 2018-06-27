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
    const { L, arukimoji } = window
    const { map, pointLayer, selectedPath, exportControl } = arukimoji
    const bounds = L.latLngBounds()
    const exportControlContainer = exportControl.getContainer()

    // clear
    pointLayer.clearLayers()

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
      // fit bounds
      if (map.getZoom() < 14) {
        map.fitBounds(bounds)
      }

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

  /**
   * selectPath
   */
  const selectPath = (feature, path) => {
    if (path.arukimoji.isSelected) {
      return
    }
    path.arukimoji.isSelected = true
    path.interactive = false
    path.unbindTooltip()
    window.arukimoji.selectedPath.push({feature, path})
    renderSelectedPath()
  }

  /**
   * unselectPath
   */
  const unselectPath = (featur, path) => {
    if (!path.arukimoji.isSelected) {
      return
    }
    path.arukimoji.isSelected = false
    path.interactive = true
    path.unbindTooltip()
    path.bindTooltip(path.arukimoji.toolTipContent)
    path.fire('mouseout')
    window.arukimoji.selectedPath = window.arukimoji.selectedPath
      .filter(item => (item.path !== path))
    renderSelectedPath()
  }

  /**
   * load GeoJSON
   * @param {string} url
   */
  const laodGeoJSON = async (url) => {
    const {L, geolib, fetch, arukimoji} = window
    const {gpsLayer, path} = arukimoji
    const colors = ['red', 'blue', 'green', 'teal', 'navy', 'purple', 'lime', 'aqua', 'orange', 'LightSalmon', 'SlateBlue', 'IndianRed', 'DarkOliveGreen']

    // fetch geojson
    const res = await fetch(url)
    const geoJSON = await res.json()
    console.log(geoJSON)

    // add layer
    const geoJSONLayer = L.geoJSON(
      geoJSON,
      {
        style: () => ({
          opacity: 0.7,
          weight: 3
        }),
        onEachFeature: (feature, layer) => {
          const coordTimes = feature.properties.coordTimes
          const start = new Date(coordTimes[0])
          const end = new Date(coordTimes[coordTimes.length - 1])
          const min = Math.round((end.getTime() - start.getTime()) / 1000 / 60)

          // get distance
          let distance = 0
          feature.geometry.coordinates
            .forEach((current, index) => {
              if (index === 0) {
                return
              }
              const prev = feature.geometry.coordinates[index - 1]
              distance += geolib.getDistance(
                {latitude: current[1], longitude: current[0]},
                {latitude: prev[1], longitude: prev[0]}
              )
            })

          // arukimoji meta data
          layer.arukimoji = {
            isSelected: false,
            toolTipContent: `${feature.properties.name}<br>${distance / 1000}km<br>${start.toLocaleString()} ~ ${end.toLocaleString()}<br>${min}min`,
            select: () => { selectPath(feature, layer) },
            unselect: () => { unselectPath(feature, layer) }
          }

          layer.setStyle({
            color: colors[Math.floor(Math.random() * colors.length)]
          })

          // tooltip
          layer.bindTooltip(layer.arukimoji.toolTipContent)

          // mouseover
          layer.on('mouseover', (e) => {
            if (layer.arukimoji.isSelected) {
              return
            }
            path
              .setLatLngs(layer.getLatLngs())
              .bringToFront()
            layer
              .setStyle({
                weight: 8,
                opacity: 0.5
              })
              .bringToFront()
          })

          // mouseout
          layer.on('mouseout', (e) => {
            if (layer.arukimoji.isSelected) {
              return
            }
            layer.setStyle({
              weight: 3,
              opacity: 0.7
            })
            path
              .setLatLngs([])
          })

          // click
          layer.on('click', (e) => {
            // select
            if (layer.arukimoji.isSelected) {
              layer.arukimoji.unselect()
            } else {
              layer.arukimoji.select()
            }
          })
        }
      }
    )
    gpsLayer.addLayer(geoJSONLayer)
  }

  window.laodGeoJSON = laodGeoJSON
})()
