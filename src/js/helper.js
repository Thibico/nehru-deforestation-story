function generateLayerFilter(attribute1, values1, attribute2=null, values2=null) {
    if (attribute2 && values2) {
      return [
        "all",
        [
          "match",
          ["get", attribute1],
          values1,
          true,
          false
        ],
        [
          "match",
          ["get", attribute2],
          values2,
          true,
          false
        ]
      ]
    } else {
      return [
        "all",
        [
          "match",
          ["get", attribute1],
          values1,
          true,
          false
        ]
      ]
    }
}

export default {generateLayerFilter};