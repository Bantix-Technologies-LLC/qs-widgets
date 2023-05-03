import React, { useReducer } from "react";
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import Spinner from "react-bootstrap/Spinner";
import "./EventConGraph.css";
import Highcharts from "highcharts/highstock";
import indicatorsAll from "highcharts/indicators/indicators-all";
import annotationsAdvanced from "highcharts/modules/annotations-advanced";
import priceIndicator from "highcharts/modules/price-indicator";
import fullScreen from "highcharts/modules/full-screen";
import stockTools from "highcharts/modules/stock-tools";
import QSIcon from "./QSIconDark3.png";
import { useParams, useSearchParams } from "react-router-dom";
import { useMediaQuery } from "react-responsive";
import DropdownButton from "react-bootstrap/DropdownButton";
import { NavDropdown, Dropdown } from "react-bootstrap";
import { ExclamationTriangle } from "react-bootstrap-icons";
import { isChrome, isFirefox, isSafari } from "react-device-detect";

// import ExpiryFutSymbolButton from "../../Components/ExpiryFutSymbolButton";
// import ProdNameToSym from "../../AuxillaryFunctions/ProdNameToSym";
require("highcharts/modules/exporting")(Highcharts);
indicatorsAll(Highcharts);
annotationsAdvanced(Highcharts);
priceIndicator(Highcharts);
fullScreen(Highcharts);
stockTools(Highcharts);

//Graph for OHLC, Volume, and OI for given future sym
const EODSummaryGraph = (props) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [sym, setSym] = useState(searchParams.get("sym"));
  const [width, setWidth] = useState(searchParams.get("width"));
  const [height, setHeight] = useState(searchParams.get("height"));

  const zoomButton = useRef(null);
  const isMobile = useMediaQuery({ query: `(max-width: 1200px)` }); //state for detecting device that app is running on
  const chartRef = useRef(null);
  const containerRef = useRef(null);
  const loadSpinnerRef = useRef(null);
  const noneAvailRef = useRef(null);

  const [categories, setCategories] = useState([[0, 0, 0, 0, 0, 0]]);
  const [callData, setCallData] = useState([[0, 0, 0, 0, 0, 0]]);
  const [putData, setPutData] = useState([[0, 0, 0, 0, 0, 0]]);
  const [allData, setAllData] = useState([[0, 0, 0, 0, 0, 0]]);

  const [options, setOptions] = useState();
  const [refreshSwitch, setRefreshSwitch] = useState(false);

  //used to store top right expiry buttons` DOM node and programatically scroll to left 0 on render
  const expButtonsRef = useRef(null);

  //SET HIGHCHARTS OPTIONS
  useEffect(() => {
    try {
      if (callData.includes("noneAvail"))
        containerRef.current.style.opacity = "0.6";
    } catch {}
    Highcharts.setOptions({
      lang: {
        decimalPoint: ".",
        thousandsSep: ",",
      },
    });

    chartRef.current = Highcharts.chart(containerRef.current, {
      chartType: "bar",
      colors: [
        "rgb(204,168,71,0.9)",
        "#AD3236",
        "#942B36",
        "#024E73",

        "#E1A33C",
        "#B31E30",
        "#B38904",
        "#B3701E",
        "#42B39A",
        "#02757D",
        "#46947a",
        "#024E73",
        "#B3431E",
        "#f39c12",
      ],
      chart: {
        width: width,
        height: height - 31,

        marginBottom: 50,
        backgroundColor: {
          linearGradient: { x1: 0, y1: 0, x2: 1, y2: 1 },
          stops: [
            [0, "#054D3D"],
            [1, "#076652"],
          ],
        },
        borderColor: "#606063",
        plotBorderColor: "#606063",
        borderWidth: 1,
        // height: 550,
        events: {
          redraw() {
            var lowPlotLineValue = 0,
              midPlotLineValue = 0,
              highPlotLineValue = 0;
            console.log(categories);

            for (let i = 0; i < categories.length - 1; i++) {
              console.log(allData.Futures[0]);
              //find low plotline value
              if (
                categories[i + 1] > allData.Futures[0].Low &&
                lowPlotLineValue === 0
              ) {
                lowPlotLineValue =
                  i +
                  (allData.Futures[0].Low - categories[i]) /
                    (categories[i + 1] - categories[i]);
              }
              //find mid plotline value
              if (
                categories[i + 1] > allData.Futures[0].Mid &&
                midPlotLineValue === 0
              ) {
                midPlotLineValue =
                  i +
                  (allData.Futures[0].Mid - categories[i]) /
                    (categories[i + 1] - categories[i]);
              }
              //find high plotline value
              if (
                categories[i + 1] > allData.Futures[0].High &&
                highPlotLineValue === 0
              ) {
                highPlotLineValue =
                  i +
                  (allData.Futures[0].High - categories[i]) /
                    (categories[i + 1] - categories[i]);
              }
              if (
                lowPlotLineValue !== 0 &&
                midPlotLineValue !== 0 &&
                highPlotLineValue !== 0
              ) {
                break;
              }
            }

            ///////////////////////
            //////Add Plot Lines///
            ///////////////////////
            this.xAxis[0].addPlotLine({
              color: "#1E7B7A",
              dashStyle: "ShortDash",
              value: lowPlotLineValue,
              width: 2.5,
              id: "low",
            });
            this.xAxis[0].addPlotLine({
              color: "rgba(215,193,136,0.5)",

              value: midPlotLineValue,
              width: 3,
              id: "mid",
            });
            this.xAxis[0].addPlotLine({
              color: "#007BB5",
              dashStyle: "ShortDash",

              value: highPlotLineValue,
              width: 2.5,
              id: "high",
            });

            ///////////////////////
            ///YES and NO Labels///
            ///////////////////////
            if (width >= 370) {
              this.addAnnotation({
                labelOptions: {
                  overflow: "allow",
                  y: -10,
                  shape: "rect",
                  borderColor: "transparent",
                  backgroundColor: "rgba(70,127,202,0.2)",
                  style: {
                    height: "2px",
                    clipPath: isChrome
                      ? "inset(4.5px 0px 3px 0px round 2px)"
                      : "inset(5.5px 0px 3px 0px round 2px)",
                    maxHeight: "2px",
                    fontSize: `${Math.min(
                      Math.max(10.5, (width / 100) * 1.9),
                      14
                    )}pt`,
                  },
                },
                shapeOptions: {
                  type: "circle",
                  r: 4,
                  strokeWidth: 0,
                },
                labels: [
                  {
                    text: "No",
                    align: "center",
                    point: {
                      y: this.yAxis[0].getExtremes().max / 2,
                      x: -0.3,
                      yAxis: 0,
                      xAxis: 0,
                    },
                    style: {
                      color: "#EB4335",
                      paintOrder: "stroke",
                      stroke: "#000000",
                      strokeWidth: "0.75px",
                      // strokeLinecap: "butt",
                      // strokeLinejoin: "miter",
                      fontWeight: "700",
                    },
                  },
                  {
                    text: "Yes",
                    align: "center",

                    point: {
                      y: -this.yAxis[0].getExtremes().max / 2,
                      x: -0.3,
                      yAxis: 0,
                      xAxis: 0,
                    },
                    style: {
                      color: "#459E54",
                      paintOrder: "stroke",
                      stroke: "#000000",
                      strokeWidth: "0.5px",
                      // strokeLinecap: "butt",
                      // strokeLinejoin: "miter",
                      fontWeight: "500",
                    },
                  },
                ],
                shapes: [
                  {
                    point: {
                      y: 20,
                      x: lowPlotLineValue,
                      yAxis: 0,
                      xAxis: 0,
                    },
                    fill: "rgb(0,111,255,0.5)",
                  },
                  {
                    point: {
                      y: -20,
                      x: highPlotLineValue,
                      yAxis: 0,
                      xAxis: 0,
                    },
                    fill: "blue",
                  },
                ],
                draggable: "",
                crop: false,
              });
            }
          },
          render: function () {
            const chart = this,
              renderer = chart.renderer;

            try {
              if (
                document.getElementsByClassName("highcharts-data-table")[0] &&
                document.getElementsByClassName("highcharts-data-table")[0]
                  .style.display !== "none"
              ) {
                document.getElementsByClassName(
                  "highcharts-data-table"
                )[0].style.display = "none";
                chart.viewData();
              }
              // chart.options.exporting.menuItemDefinitions.viewData.onclick();
              // try {
              //   chart.options.exporting.menuItemDefinitions.viewData.onclick();
              // } catch {}
            } catch {}
            // Delete groups
            if (chart.customImgGroup) {
              chart.customImgGroup.destroy();
            }

            // Create groups
            chart.customImgGroup = renderer.g("customImgGroup").add();
            // Render texts
            chart.renderer
              .image(QSIcon, chart.plotBox.width, 20, 50, 50)
              .add(chart.customImgGroup);
          },
          load() {
            try {
              let chart = this;
              chart.stockTools.showhideBtn.click();
            } catch {}
          },
        },
      },

      tooltip: {
        formatter: function () {
          return `<span style="font-size:10px">${
            this.x
          }</span><br/><span style="color:${this.series.color}">● </span>${
            this.series.name
          }: <b> ${Highcharts.numberFormat(
            this.series.name === "Call" ? -this.y : this.y,
            0
          )} `;
        },

        backgroundColor: "transparent",
        style: {
          color: "#F0F0F0",
        },
      },
      labels: {
        style: {
          color: "#707073",
        },
      },
      drilldown: {
        activeAxisLabelStyle: {
          color: "#F0F0F3",
        },
        activeDataLabelStyle: {
          color: "#F0F0F3",
        },
      },
      plotOptions: {
        series: {
          maxPointWidth: 20,
          //   dataLabels: {
          //     color: "#F0F0F3",
          //     style: {
          //       fontSize: "13px",
          //     },
          //   },
          marker: {
            lineColor: "white",
          },
          stacking: "normal",
          borderRadius: "3%",
        },
        boxplot: {
          //   fillColor: "#505053",
        },
        candlestick: {
          lineColor: "white",
        },
        errorbar: {
          color: "white",
        },
        bar: {
          //   dataLabels: {
          //     enabled: true,
          //     align: "center",
          //   },
          borderWidth: 0.5,
        },
      },
      annotations: [
        {
          shapeOptions: {
            type: "circle",
            r: 4,
            strokeWidth: 0,
          },
          shapes: [
            {
              point: {
                y: -20,
                x: allData.Futures === undefined ? 0 : allData.Futures[0].Low,
                yAxis: 0,
                xAxis: 0,
              },
              fill: "blue",
            },
            {
              point: {
                y: 50,
                x: 50,
                yAxis: 0,
                xAxis: 0,
              },
              fill: "blue",
            },
          ],
        },
      ],
      legend: {
        enabled: false,
        itemMarginBottom: 0,
        itemMarginTop: 0,
        margin: 0,
        x: -30,
        align: "center",
        itemStyle: {
          color: "#E0E0E3",
        },
        itemHoverStyle: {
          color: "#FFF",
        },
        itemHiddenStyle: {
          color: "#606063",
        },
        title: {
          style: {
            color: "#C0C0C0",
          },
        },
      },
      scrollbar: {
        barBackgroundColor: "#808083",
        barBorderColor: "#808083",
        buttonArrowColor: "#CCC",
        buttonBackgroundColor: "#606063",
        buttonBorderColor: "#606063",
        rifleColor: "#FFF",
        trackBackgroundColor: "#404043",
        trackBorderColor: "#404043",
      },
      title: {
        text:
          allData.Futures === undefined
            ? sym
            : `${sym} (${allData.Futures[0].Symbol})`,
        align: "left",
        style: {
          color: "#E0E0E3",
          textTransform: "uppercase",
          fontSize: "16px",
        },
      },
      navigation: {
        buttonOptions: {
          symbolStroke: "#DDDDDD",
          theme: {
            fill: "#505053",
            states: {
              hover: {
                fill: "#707073",
              },
              select: {
                fill: "#707073",
              },
            },
          },
        },
      },
      navigator: {
        handles: {
          backgroundColor: "#666",
          borderColor: "#AAA",
        },
        outlineColor: "#CCC",
        maskFill: "rgba(255,255,255,0.1)",
        series: {
          color: "#7798BF",
          lineColor: "#A6C7ED",
        },
        xAxis: {
          gridLineColor: "#505053",
        },
      },
      subtitle: {
        style: {
          color: "#E0E0E3",
          textTransform: "uppercase",
        },
      },

      xAxis: [
        {
          plotLines: [
            {
              // mark the weekend
              color: "red",
              width: 20,
              x: 9.5,
              dashStyle: "longdashdot",
            },
          ],
          gridLineColor: "white",
          labels: {
            style: {
              color: "#E0E0E3",
            },
            step: 1,
          },
          lineColor: "#707073",
          minorGridLineColor: "#505053",
          tickColor: "#707073",
          title: {
            style: {
              color: "#A0A0A3",
            },
          },

          categories: categories,
          reversed: true,
          accessibility: {
            description: "call",
          },
        },
        {
          gridLineColor: "#444",
          labels: {
            style: {
              color: "#E0E0E3",
            },
            step: 1,
          },
          lineColor: "#707073",
          minorGridLineColor: "#505053",
          tickColor: "#707073",
          title: {
            style: {
              color: "#A0A0A3",
            },
          },
          // mirror axis on right side
          opposite: true,
          reversed: true,
          categories: categories,
          linkedTo: 0,

          accessibility: {
            description: "put",
          },
        },
      ],
      yAxis: {
        gridLineColor: "#E0E0E3",
        labels: {
          style: {
            color: "#E0E0E3",
          },
        },
        crosshair: {
          label: {
            backgroundColor: "rgba(0, 0, 0, 0.60)",
          },
        },
        lineColor: "#707073",
        minorGridLineColor: "#505053",
        tickColor: "#707073",
        tickWidth: 1,
        title: {
          style: {
            color: "#A0A0A3",
          },
        },

        title: {
          text: null,
        },
        min: callData.includes("noneAvail")
          ? 0
          : Math.max(
              Math.max(
                ...callData.map((callprice) => {
                  return Math.abs(callprice);
                })
              ),
              Math.max(...putData)
            ) * -1,
        max: callData.includes("noneAvail")
          ? 0
          : Math.max(
              Math.max(
                ...callData.map((callprice) => {
                  return Math.abs(callprice);
                })
              ),
              Math.max(...putData)
            ),

        labels: {
          style: {
            color: "white",
          },
          formatter: function () {
            return Math.abs(this.value);
          },
        },
        accessibility: {
          description: "Price",
        },
      },

      series: [
        {
          name: "Call",
          data: callData,
          type: "bar",
          dataLabels: {
            formatter: function () {
              console.log(this);
              return Math.abs(this.y);
            },

            padding: 5,
            // backgroundColor: "blue",
            // borderWidth: 2,
            animation: {
              defer: 6000,
            },
            verticalAlign: "middle",
            style: {
              color: "#C8C8C8",
              fontSize: "10.5px",
              strokeWidth: "0.2px",
              fontWeight: "bold",
              textOutline: "black",
              fontStyle: "italic",
            },
            enabled: true,
            align: "right",
            x: -1,
            // y: -1,
          },
        },
        {
          name: "Put",
          data: putData,
          type: "bar",
          dataLabels: {
            // useHTML: true,
            verticalAlign: "middle",
            // shape: "callout",
            // backgroundColor: "blue",
            enabled: true,
            position: "right",
            inside: true,
            padding: 2,
            y: -1,
            style: {
              color: "#D4D4D4",
              fontSize: "9px",
              strokeWidth: "0.5px",
              fontWeight: "bold",
              textOutline: "black",
              fontStyle: "italic",
            },
            align: "left",
            x: 1,
          },
        },
      ],
      exporting: {
        buttons: {
          contextButton: {
            menuItems: [
              "viewFullscreen",
              "printChart",
              "separator",
              "downloadPNG",
              "downloadJPEG",
              "downloadPDF",
              "downloadSVG",
              // eslint-disable-next-line no-restricted-globals
              location.search.includes("qs=1") ? "separator" : "",
              // eslint-disable-next-line no-restricted-globals
              location.search.includes("qs=1") ? "downloadCSV" : "",
              // eslint-disable-next-line no-restricted-globals
              location.search.includes("qs=1") ? "downloadXLS" : "",
              "separator",
              "viewData",
            ],
          },
        },
        menuItemDefinitions: {
          viewFullscreen: {
            onclick: function () {
              this.fullscreen.toggle();
            },
          },
          viewData: {
            onclick: function () {
              if (
                document.getElementsByClassName("highcharts-data-table")[0] &&
                document.getElementsByClassName("highcharts-data-table")[0]
                  .style.display !== "none"
              ) {
                document.getElementsByClassName(
                  "highcharts-data-table"
                )[0].style.display = "none";
              } else {
                try {
                  this.viewData.text = "Hide data table";
                } catch {}
                try {
                  this.viewData();
                } catch {}
                document.getElementsByClassName(
                  "highcharts-data-table"
                )[0].style.display = "";
              }
            },
            sourceWidth: 1000,
          },
        },
        sourceWidth: 1000,
      },
      credits: {
        enabled: false,
      },
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options, callData, chartRef.current, isMobile]);

  useEffect(() => {
    setCallData([]);
    setPutData([]);

    try {
      loadSpinnerRef.current.style.animationFillMode = "forwards";
      loadSpinnerRef.current.style.visibility = "visible";
      loadSpinnerRef.current.style.opacity = "1";
      containerRef.current.style.opacity = callData.includes("noneAvail")
        ? "0.6"
        : "0.9";
    } catch {}

    let CancelToken = axios.CancelToken;
    let source = CancelToken.source();
    axios(
      //   `https://quikoptions.info/api/straddles?straddleSym=${sym}`
      `https://quikoptions.info/api/eventConData?eventConDataProdSym=${sym.toUpperCase()}`,
      { cancelToken: source.token }
    ).then((response) => {
      console.log(response.data);
      if (response.data.Symbol !== undefined) {
        window.sym = response.data.Symbol;
      } else if (response.data.includes("NONE AVAIL")) {
        setCallData("noneAvail");
        setOptions();
        return;
      }
      if (
        response.data.Symbol !== sym.toUpperCase() &&
        window.sym !== sym.toUpperCase()
      ) {
        setRefreshSwitch(!refreshSwitch);
        return;
      }
      setAllData(response.data);

      try {
        containerRef.current.style.opacity = callData.includes("noneAvail")
          ? "0.6"
          : "1";

        loadSpinnerRef.current.style.visibility = "hidden";
        loadSpinnerRef.current.style.opacity = "0";

        console.log("!!");

        if (response.data.Symbol === undefined) {
          setCallData("noneAvail");
        } else {
          //   setCategories(response.data.map((strike) => strike.StrikePrice));
          //   setCallData(response.data.map((strike) => strike.CallPrice * -1));
          //   setPutData(response.data.map((strike) => strike.PutPrice));

          setCategories(
            response.data.Futures[0].Expirations[0].Strikes.filter(
              (strike) => strike.Call.Mid !== null && strike.Put.Mid !== null
            ).map((strike) => strike.StrikePrice)
          );
          setCallData(
            response.data.Futures[0].Expirations[0].Strikes.filter(
              (strike) => strike.Call.Mid !== null && strike.Put.Mid !== null
            ).map((strike) => strike.Call.Mid * -1)
          );
          setPutData(
            response.data.Futures[0].Expirations[0].Strikes.filter(
              (strike) => strike.Call.Mid !== null && strike.Put.Mid !== null
            ).map((strike) => strike.Put.Mid)
          );
        }
        console.log(
          response.data.Futures[0].Expirations[0].Strikes.map(
            (strike) => strike.Put.Last
          ),
          response.data.Futures[0].Expirations[0].Strikes.map(
            (strike) => strike.Call.Last
          ),
          response.data.Futures[0].Expirations[0].Strikes.map(
            (strike) => strike.StrikePrice
          )
        );

        //   calldata = [];

        console.log("Setdata");
        setOptions();
      } catch {
        // console.log(data);
      }
      try {
        //make sure scroll position of expiry symbol buttons (top right) goes back to 0
        expButtonsRef.current.__forceSmoothScrollPolyfill__ = true;
        expButtonsRef.current.scrollTo(0, 0);
      } catch {}
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshSwitch]);

  return (
    <div
      className={
        isChrome
          ? "eventConDivChrome"
          : isSafari
          ? "eventConDivSafari"
          : isFirefox
          ? "eventConDivFirefox"
          : "eventConDivSafari"
      }
      style={{
        width: `${width}px`,
        height: `${height}px`,
      }}
    >
      {/* "#42B39A",
        "#02757D",
        "#46947a", "#075645"*/}
      <div
        style={{
          background: "linear-gradient(60deg,  #075645,#46947a, #075645)",
          width: `${width - 3}px`,
          height: `${30}px`,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          //   borderBottom: "1px inset blue",
        }}
      >
        <div style={{ fontWeight: "450" }}>
          {allData.Futures === undefined ? (
            ""
          ) : (
            <div>
              <span
                style={{ color: "white", fontWeight: "500" }}
              >{`${allData.Futures[0].Symbol}`}</span>
              <span
                style={{ color: "white" }}
              >{` @ ${allData.Futures[0].Last}`}</span>
              <span> (</span>
              <span
                style={{
                  color:
                    allData.Futures[0].Last - allData.Futures[0].Settle > 0
                      ? "#84CD85"
                      : "red",
                }}
              >{`${Intl.NumberFormat("en-US", {
                signDisplay: "exceptZero",
              }).format(
                (allData.Futures[0].Last - allData.Futures[0].Settle).toFixed(3)
              )}`}</span>
              <span>)</span>
            </div>
          )}
        </div>
      </div>
      {/* <img
        src={QSIcon}
        style={{
          pointerEvents: "none",
          position: "fixed",
          zIndex: "200",
          width: `${Math.max(Math.min(width * height * 0.0005, 100), 55)}px`,
          height: `${Math.max(Math.min(width * height * 0.0005, 100), 55)}px`,
          left: `${
            width - Math.max(Math.min(width * height * 0.0005, 100), 55) * 1.45
          }px`,
          top: "25px",
          transform: `translate(-10%, -10%)`,
          webkitTransform: `translate(-10%, -10%)`,
        }}
      ></img> */}
      {callData.includes("noneAvail") ? (
        <div
          ref={noneAvailRef}
          style={{
            transition: "all 0.25s ease",
            position: "absolute",
            // fontSize: "1vw",
            // left: "45%",
            // bottom: "50%",
            width: `${width}px`,
            height: `${height}px`,
            zIndex: "100",

            color: "rgba(176, 192, 209,0.3)",
          }}
        >
          <div
            style={{
              position: "absolute",

              width: `${width}px`,
              height: `${height}px`,
              //   transform: "translate(112.5%,-40%) scale(2.5,2.5)",
              opacity: "0.55",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: `translate(-50%, -50%) scale(${
                  (0.005 * `${width}`, 0.005 * `${width}`)
                })`,
                webkitTransform: `translate(-50%, -50%) scale(${
                  (0.005 * `${width}`, 0.005 * `${width}`)
                })`,
              }}
            >
              <ExclamationTriangle sz="lg" />
              Plot Unavailable
            </div>
          </div>
        </div>
      ) : (
        <>
          <div
            ref={loadSpinnerRef}
            style={{
              transition: "all 0.25s ease",
              position: "absolute",
              //   left: "50%",
              //   bottom: "50%",
              width: `${width}px`,
              height: `${height}px`,
              zIndex: "100",
              //   transform: "scale(3.5,3.5)",
            }}
          >
            <Spinner
              animation="border"
              variant={props.lightMode ? "secondary" : "light"}
            />
          </div>
        </>
      )}
      <div
        ref={containerRef}
        highcharts={Highcharts}
        constructorType={"stockChart"}
        updateArgs={[true, true, true]}
        options={options}
        allowChartUpdate={true}
        immutable={false}
        callback={useEffect}
      />
    </div>
  );
};

export default EODSummaryGraph;
