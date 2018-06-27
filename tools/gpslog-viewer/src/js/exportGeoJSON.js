(() => {
  const exportGeoJSON = (filename) => {
    const { selectedPath } = window.arukimoji
    if (selectedPath.length === 0) {
      return
    }
    const geojson = {
      type: 'Feature',
      bbox: [],
      properties: {
        origin: []
      },
      geometry: {
        type: 'MultiLineString',
        coordinates: []
      }
    }

    selectedPath
      .forEach(({path, feature}) => {
        const { properties, geometry } = feature
        const { name, time } = properties
        geojson.properties.origin.push({
          name, time
        })
        geojson.geometry.coordinates.push(geometry.coordinates)
      })
    const blob = new window.Blob([JSON.stringify(geojson, null, 2)], {type: 'application/json'})
    const url = window.URL.createObjectURL(blob)
    const link = window.document.createElement('a')
    link.href = url
    link.download = `${filename}.geojson`
    link.click()
    window.URL.revokeObjectURL(url)
  }
  window.exportGeoJSON = exportGeoJSON
})()
