window.onload = () => {

    // 세슘에서 지원하는 기본 ui 모두 제거하고 지도만 보이도록 셋팅
    const viewer = new Cesium.Viewer("cesiumContainer", {
        terrainProvider: Cesium.createWorldTerrain(),
        animation: false,
        baseLayerPicker: false,
        fullscreenButton: false,
        vrButton: false,
        geocoder: false,
        homeButton: false,
        infoBox: false,
        sceneModePicker: false,
        selectionIndicator: false,
        timeline: false,
        navigationHelpButton: false,
        projectionPicker: false,
        selectedEntity: false,
        trackedEntity: false,
        clockTrackedDataSource: false,
    });


    viewer.scene.camera.setView({
        destination: Cesium.Cartesian3.fromDegrees(-122.3572, 47.508, 370),
        orientation: {
            // heading = 각도가 동쪽으로 증가하는 로컬 북쪽 방향에서의 회전
            heading: Cesium.Math.toRadians(10),
            // pitch = 로컬 xy 평면에서의 회전
            pitch: Cesium.Math.toRadians(-10),
        },
    });

    //---------------------------------------------------
    // draw point mouse event
    //---------------------------------------------------

    const osmBuildingsTileset = Cesium.createOsmBuildings();
    viewer.scene.primitives.add(osmBuildingsTileset);
    
    const ellipsoid = viewer.scene.globe.ellipsoid;
    const handler = new Cesium.ScreenSpaceEventHandler(viewer.canvas);
    const scene = viewer.scene;

    handler.setInputAction( event => {
        if (event.position != null) {
            const cartesian = scene.camera.pickEllipsoid(event.position, ellipsoid);
            if (cartesian) {
                const cartographic = Cesium.Cartographic.fromCartesian(cartesian);
                const longitude = Cesium.Math.toDegrees(cartographic.longitude);
                const latitude = Cesium.Math.toDegrees(cartographic.latitude);

                const point = scene.primitives.add(new Cesium.PointPrimitiveCollection());
                point.add({
                    position: Cesium.Cartesian3.fromDegrees(longitude, latitude),
                    color: Cesium.Color.RED, // default: WHITE
                });
            }
            
        }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

    //---------------------------------------------------
    // polygon
    //---------------------------------------------------

    const polygon = viewer.entities.add({
        polygon:{
            hierarchy: 
                Cesium.Cartesian3.fromDegreesArray([
                    -122.3572, 47.518, 
                    -122.3072, 47.508, 
                    -122.3172, 47.528, 
                    -122.3272, 47.538, 
                    -122.3372, 47.548, 
                    -122.3472, 47.558
                ]),
                height: 200,
                material : Cesium.Color.RED.withAlpha(0.5),
                outline: true,
                outlineColor : Cesium.Color.BLACK
        }
    })
    viewer.zoomTo(polygon)
}
