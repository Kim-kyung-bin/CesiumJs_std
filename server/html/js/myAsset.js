window.onload = () => {

    // Get your token from https://cesium.com/ion/tokens
    // 개인 토큰
    Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI3ZWZlYWVlYi0zZDQ0LTQ4N2QtOTk4Ni04Y2ZhNzU2MzgzZjYiLCJpZCI6OTIyMTQsImlhdCI6MTY1MTY1MTI4MX0.IB6I9lHC4A4CrtdQNK2gNyFlNvG7AXEkCcT6_TakcrM';

    // STEP 2 CODE
    // 세슘 월드 뷰어 지형 초기화
    const viewer = new Cesium.Viewer('cesiumContainer', {
        terrainProvider: Cesium.createWorldTerrain()
    });
    // OSM 빌딩 추가 
    const buildingsTileset = viewer.scene.primitives.add(Cesium.createOsmBuildings());
    // 경도 , 위도 , 높이 카메라 셋팅
    viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(-104.9965, 39.74248, 4000)
    });

    // STEP 3 CODE
    const addBuildingGeoJSON = async () => {
        // Cesium ion 에서 GeoJSON 을 로드
        const geoJSONURL = await Cesium.IonResource.fromAssetId(988574);
        // GeoJSON 에서 형상을 만들고 지면에 고정
        const geoJSON = await Cesium.GeoJsonDataSource.load(geoJSONURL, { clampToGround: true });
        // scene 에 추가
        const dataSource = await viewer.dataSources.add(geoJSON);
        // 기본적으로 Cesium 의 polygons 은 모든 3d 컨텐츠에 덮여씌워짐
        // 그렇기 때문에 polygon 이 건물이 아닌 지형에만 덮여씌워지게 수정
        for (const entity of dataSource.entities.values) {
            entity.polygon.classificationType = Cesium.ClassificationType.TERRAIN;
        }
        // 추가한 polygons 이 보이는 위치로 카메라 이동
        viewer.flyTo(dataSource);
    }
    addBuildingGeoJSON();

    // STEP 4 CODE
    // 추가한 polygon 의 영역에 개별 건물을 숨김
    buildingsTileset.style = new Cesium.Cesium3DTileStyle({
        // 스타일 규칙을 만들어서 건물의 표시 속성을 제어
        show: {
            conditions: [
                // 3d 모델링 타일을 올린위치에 원래 존재하는 개별 영역을 숨김
                ['${elementId} === 532245203', false],
                ['${elementId} === 332469316', false],
                ['${elementId} === 332469317', false],
                ['${elementId} === 235368665', false],
                ['${elementId} === 530288180', false],
                ['${elementId} === 530288179', false],
                // else
                [true, true]
            ]
        },
        // 이 특정 3D 타일 세트의 기본 색상 스타일을 설정
        // Cesium#color 속성을 가진 건물은 해당 색상을 사용하고 그렇지 않으면 흰색으로 만듬
        color: "Boolean(${feature['cesium#color']}) ? color(${feature['cesium#color']}) : color('#ffffff')"
    });

    // STEP 6 CODE
    // Cesium ion 에서 만든 3D Tailset을 추가
    const newBuildingTileset = viewer.scene.primitives.add(
        new Cesium.Cesium3DTileset({
            // 추가한 3D Tailset
            url: Cesium.IonResource.fromAssetId(988577),
        })
    );
    // 추가한 Tileset이 있는 위치로 카메라 이동
    viewer.flyTo(newBuildingTileset);

    // STEP 7 CODE
    // 빌딩을 클릭하면 타일세트의 표시속성을 표시
    document.querySelector('#toggle-building').onclick = function () {
        newBuildingTileset.show = !newBuildingTileset.show;
    };
}
