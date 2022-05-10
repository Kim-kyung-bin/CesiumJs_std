window.onload = () => {

    //-------------------------------------------------------
    // init
    //-------------------------------------------------------   
    
    // Cesium 지형정보 초기화
    const viewer = new Cesium.Viewer("cesiumContainer", {
        terrainProvider: Cesium.createWorldTerrain(),
        timeline: false,
        animation: false,
    });

    // view canvas 를 조작하기위한 handler 설정
    const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);

    // OSM 빌딩 3D Tile 생성
    const osmBuildingsTileset = Cesium.createOsmBuildings();
    viewer.scene.primitives.add(osmBuildingsTileset);

    // 카메라 기본 위치 설정  경도 / 위도 / 높이
    viewer.scene.camera.setView({
        destination: Cesium.Cartesian3.fromDegrees(-122.3472, 47.598, 370),
        orientation: {
            // heading = 각도가 동쪽으로 증가하는 로컬 북쪽 방향에서의 회전
            heading: Cesium.Math.toRadians(10),
            // pitch = 로컬 xy 평면에서의 회전
            pitch: Cesium.Math.toRadians(-10),
        },
    });

    
    //-------------------------------------------------------
    // Styling functions
    //-------------------------------------------------------

    // 빌딩의 material 값을 체크한 후 값에 따라서 색상 지정
    const colorByMaterial = () => {
        osmBuildingsTileset.style = new Cesium.Cesium3DTileStyle({
            defines: {
                material: "${feature['building:material']}",
            },
            color: {
                conditions: [
                    ["${material} === null", "color('white')"],
                    ["${material} === 'glass'", "color('skyblue', 0.5)"],
                    ["${material} === 'concrete'", "color('grey')"],
                    ["${material} === 'brick'", "color('indianred')"],
                    ["${material} === 'stone'", "color('lightslategrey')"],
                    ["${material} === 'metal'", "color('lightgrey')"],
                    ["${material} === 'steel'", "color('lightsteelblue')"],
                    ["true", "color('white')"], // This is the else case
                ],
            },
        });
    }

    // feature 의 building 타입이 apartments or residential 인 경우에만 색변경
    const highlightAllResidentialBuildings = () => {
        osmBuildingsTileset.style = new Cesium.Cesium3DTileStyle({
            color: {
                conditions: [
                    [
                        "${feature['building']} === 'apartments' || ${feature['building']} === 'residential'",
                        "color('cyan', 0.9)",
                    ],
                    [true, "color('white')"],
                ],
            },
        });
    }

    //선택한 building type 의 타일만 보이도록 설정
    const showByBuildingType = (buildingType) => {
        switch (buildingType) {
            case "office":
                osmBuildingsTileset.style = new Cesium.Cesium3DTileStyle({
                    show: "${feature['building']} === 'office'",
                });
                break;
            case "apartments":
                osmBuildingsTileset.style = new Cesium.Cesium3DTileStyle({
                    show: "${feature['building']} === 'apartments'",
                });
                break;
            default:
                break;
        }
    }

    // 선택한 건물을 기준으로 거리 비례 색상변경
    const colorByDistanceToCoordinate = (pickedLatitude, pickedLongitude) => {
        osmBuildingsTileset.style = new Cesium.Cesium3DTileStyle({
            defines: {
                distance: `distance(vec2(\${feature['cesium#longitude']}, \${feature['cesium#latitude']}), vec2(${pickedLongitude},${pickedLatitude}))`,
            },
            color: {
                conditions: [
                    ["${distance} > 0.014", "color('blue')"],
                    ["${distance} > 0.010", "color('green')"],
                    ["${distance} > 0.006", "color('yellow')"],
                    ["${distance} > 0.0001", "color('red')"],
                    ["true", "color('white')"],
                ],
            },
        });
    }

    // 선택한 옵션이 "Color By Distance To Selected Location" 이 아닌경우,
    // 마우스 좌클릭 시 건물선택 이벤트를 삭제
    const removeCoordinatePickingOnLeftClick = () => {
        document.querySelector(".infoPanel").style.visibility = "hidden";
        handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
    }

    // 드롭다운 메뉴 옵션에 이벤트리스너 추가
    document.querySelector(".infoPanel").style.visibility = "hidden";
    const menu = document.getElementById("dropdown");

    // Color By Building Material
    menu.options[0].onselect = () => {
        removeCoordinatePickingOnLeftClick();
        colorByMaterial();
    };

    // Color By Distance To Selected Location
    menu.options[1].onselect = () => {
        // Default 선택 위치 설정
        colorByDistanceToCoordinate(47.62051, -122.34931);
        document.querySelector(".infoPanel").style.visibility = "visible";
        // 좌클릭한 건물의 좌표정보를 가져옴
        handler.setInputAction((movement) => {
            viewer.selectedEntity = undefined;
            const pickedBuilding = viewer.scene.pick(movement.position);
            if (pickedBuilding) {
                const pickedLatitude = pickedBuilding.getProperty(
                    "cesium#latitude"
                );
                const pickedLongitude = pickedBuilding.getProperty(
                    "cesium#longitude"
                );
                colorByDistanceToCoordinate(pickedLatitude, pickedLongitude);
            }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    };
    // Highlight Residential Buildings 선택
    menu.options[2].onselect = () => {
        removeCoordinatePickingOnLeftClick();
        highlightAllResidentialBuildings();
    };
    // Show Office Buildings Only 선택
    menu.options[3].onselect = () => {
        removeCoordinatePickingOnLeftClick();
        showByBuildingType("office");
    };
    // Show Apartment Buildings Only 선택
    menu.options[4].onselect = () => {
        removeCoordinatePickingOnLeftClick();
        showByBuildingType("apartments");
    };
    // 메뉴 체인지 이벤트
    menu.onchange = () => {
        //Sandcastle.reset();
        const item = menu.options[menu.selectedIndex];
        if (item && typeof item.onselect === "function") {
            item.onselect();
        }
    };

    colorByMaterial();

    //-------------------------------------------------------
    // map pins
    //-------------------------------------------------------

    const pinBuilder = new Cesium.PinBuilder();

    const bluePin = viewer.entities.add({
        name: "Blank blue pin",
        position: Cesium.Cartesian3.fromDegrees(-75.170726, 39.9208667),
        billboard: {
            image: pinBuilder.fromColor(Cesium.Color.ROYALBLUE, 48).toDataURL(),
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
        },
    });
    const questionPin = viewer.entities.add({
        name: "Question mark",
        position: Cesium.Cartesian3.fromDegrees(-75.1698529, 39.9220071),
        billboard: {
            image: pinBuilder.fromText("?", Cesium.Color.BLACK, 48).toDataURL(),
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
        },
    });

    const url = Cesium.buildModuleUrl("Assets/Textures/maki/grocery.png");
    const groceryPin = Promise.resolve(
        pinBuilder.fromUrl(url, Cesium.Color.GREEN, 48)
    ).then( canvas => {
        return viewer.entities.add({
            name: "Grocery store",
            position: Cesium.Cartesian3.fromDegrees(-75.1705217, 39.921786),
            billboard: {
                image: canvas.toDataURL(),
                verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
            },
        });
    });

    //Create a red pin representing a hospital from the maki icon set.
    const hospitalPin = Promise.resolve(
        pinBuilder.fromMakiIconId("hospital", Cesium.Color.RED, 48)
    ).then( canvas => {
        return viewer.entities.add({
            name: "Hospital",
            position: Cesium.Cartesian3.fromDegrees(-75.1698606, 39.9211275),
            billboard: {
                image: canvas.toDataURL(),
                verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
            },
        });
    });


    //Since some of the pins are created asynchronously, wait for them all to load before zooming/
    Promise.all([bluePin, questionPin, groceryPin, hospitalPin]).then(
        pins => {
            viewer.zoomTo(pins);
        }
    );


}