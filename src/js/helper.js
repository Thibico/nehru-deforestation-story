function generateLayerFilter(attributeName, valuesList) {
    return [
        "all",
        [
          "match",
          ["get", attributeName],
          valuesList,
          true,
          false
        ]
    ]
}

export default {generateLayerFilter};