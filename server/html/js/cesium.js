//Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI3ZWZlYWVlYi0zZDQ0LTQ4N2QtOTk4Ni04Y2ZhNzU2MzgzZjYiLCJpZCI6OTIyMTQsImlhdCI6MTY1MTY1MTI4MX0.IB6I9lHC4A4CrtdQNK2gNyFlNvG7AXEkCcT6_TakcrM';
window.onload = function(){

  const viewer = new Cesium.Viewer('cesiumContainer',{
    terrainProvider: Cesium.createWorldTerrain(),
  })

  const scene = viewer.scene;
  console.log(viewer.scene)
  if(!scene.clampToHeightSupported){
    window.alert(
      "This browser does not support clampToHeightMostDetailed."
    )
  }
  // 건물 모델링
  const tileset = scene.primitives.add(
    new Cesium.Cesium3DTileset({
      url: Cesium.IonResource.fromAssetId(40866)
    })
  )

  scene.camera.setView({
    destination: new Cesium.Cartesian3(
      1216411.0748779264,
      -4736313.10747583,
      4081359.5125561724
    ),
    orientation: new Cesium.HeadingPitchRoll(
      4.239925103568368,
      -0.4911293834802475,
      6.279849292088564
    ),
    endTransform: Cesium.Matrix4.IDENTITY,
  })


}
