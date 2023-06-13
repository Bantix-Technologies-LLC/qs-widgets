import React from "react";
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
import QSIconLight from "./graphQS.png";
import QSIconDark from "./QSIconLight.png";
import PYTLogo from "./logoWM-dark.png";
import { useSearchParams } from "react-router-dom";
import { useMediaQuery } from "react-responsive";
import { ExclamationTriangle } from "react-bootstrap-icons";
import { isChrome, isFirefox, isSafari } from "react-device-detect";
import BarLabelButtons from "./BarLabelButtons";
import BarLabelDropdown from "./BarLabelDropdown";
import futToOpt from "./FutToOptMappings";

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
  const [sym, setSym] = useState(
    futToOpt[searchParams.get("sym").toUpperCase()] === undefined
      ? searchParams.get("sym").toUpperCase()
      : futToOpt[searchParams.get("sym").toUpperCase()]
  );
  const [width, setWidth] = useState(searchParams.get("width"));
  const [height, setHeight] = useState(searchParams.get("height"));
  const [strikeRange, setStrikeRange] = useState(
    Number(searchParams.get("strikerange"))
  );
  const [theme, setTheme] = useState(
    [1, 2, 3].includes(Number(searchParams.get("theme")))
      ? Number(searchParams.get("theme"))
      : 0
  );
  const [barLabelType, setBarLabelType] = useState(
    // searchParams.get("labeltype") ||
    "Premium"
  );
  const [coBrandLogoID, setCoBrandLogoID] = useState(
    Number(searchParams.get("cobrandlogoid")) || 0
  );

  const zoomButton = useRef(null);
  const isMobile = useMediaQuery({ query: `(max-width: 1200px)` }); //state for detecting device that app is running on
  const chartRef = useRef(null);
  const containerRef = useRef(null);
  const loadSpinnerRef = useRef(null);
  const noneAvailRef = useRef(null);

  const [categories, setCategories] = useState([[0, 0, 0, 0, 0, 0]]);
  const [callData, setCallData] = useState([[0, 0, 0, 0, 0, 0]]);
  const [callVols, setCallVols] = useState([[0, 0, 0, 0, 0, 0]]);
  const [callProbabilities, setCallProbabilities] = useState([
    [0, 0, 0, 0, 0, 0],
  ]);
  const [callChgs, setCallChgs] = useState([[0, 0, 0, 0, 0, 0]]);
  const [callMaxProfits, setCallMaxProfits] = useState([[0, 0, 0, 0, 0, 0]]);

  const [putData, setPutData] = useState([[0, 0, 0, 0, 0, 0]]);
  const [putVols, setPutVols] = useState([[0, 0, 0, 0, 0, 0]]);
  const [putProbabilities, setPutProbabilities] = useState([
    [0, 0, 0, 0, 0, 0],
  ]);
  const [putChgs, setPutChgs] = useState([[0, 0, 0, 0, 0, 0]]);
  const [putMaxProfits, setPutMaxProfits] = useState([[0, 0, 0, 0, 0, 0]]);

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
      colors:
        theme === 2
          ? [
              "rgb(69,158,84,0.9)",
              "#DD4047",
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
            ]
          : theme === 1
          ? [
              "rgb(69,158,84,0.9)",
              "#DD4047",
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
            ]
          : [
              "rgb(69,158,84,0.9)",
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
      stockTools: {
        // enabled: false,
        gui: {
          enabled: false,
        },
      },
      chart: {
        width:
          width -
          (isChrome && [1, 2].includes(theme)
            ? 1.5
            : isChrome && theme === 3
            ? 2.5
            : 0),
        height: height - 31,

        marginTop: 42,
        backgroundColor:
          theme === 1
            ? {
                radialGradient: { cx: 0.5, cy: 0.5, r: 0.9 },
                stops: [
                  [0, "#E1E1E1"],

                  [0.2, "#DDDDDD"],
                  [0.5, "#EEEEEE"],
                  [0.65, "#E7E7E7"],
                  [1, "#E1E1E1"],
                  // [3, "white"],
                ],
              }
            : theme === 2
            ? {
                linearGradient: { x1: 0, y1: 0, x2: 1, y2: 0 },
                stops: [
                  [0, "#CCD9DC"],
                  [1, "#EEF2F1"],
                ],
              }
            : theme === 3
            ? {
                linearGradient: { x1: 0, y1: 0, x2: 1, y2: 0 },
                stops: [
                  [0, "#4c4c4c"],
                  [0.5, "#191919"],
                  //   [0.5, "black"],
                  [1, "#444444"],
                ],
              }
            : {
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
          redraw() {},
          render: function () {
            console.log(this);
            try {
              const low = allData.Futures[0].Low,
                mid = allData.Futures[0].Mid,
                high = allData.Futures[0].High,
                settle = allData.Futures[0].Settle;
              var lowPlotLineValue = 0,
                midPlotLineValue = 0,
                highPlotLineValue = 0,
                settlePlotLineValue = 0;

              var lowPlotLineEnabled = low > categories[0];
              var highPlotLineEnabled =
                high < categories[categories.length - 1];
              var settlePlotLineEnabled =
                settle > categories[0] &&
                settle < categories[categories.length - 1];

              for (let i = 0; i < categories.length - 1; i++) {
                //find low plotline value
                if (categories[i + 1] > low && lowPlotLineValue === 0) {
                  lowPlotLineValue =
                    i +
                    (low - categories[i]) / (categories[i + 1] - categories[i]);
                }
                //find mid plotline value
                if (categories[i + 1] > mid && midPlotLineValue === 0) {
                  midPlotLineValue =
                    i +
                    (mid - categories[i]) / (categories[i + 1] - categories[i]);
                }
                //find high plotline value
                if (categories[i + 1] > high && highPlotLineValue === 0) {
                  highPlotLineValue =
                    i +
                    (high - categories[i]) /
                      (categories[i + 1] - categories[i]);
                }
                //find settle plotline value
                if (categories[i + 1] > settle && highPlotLineValue === 0) {
                  settlePlotLineValue =
                    i +
                    (settle - categories[i]) /
                      (categories[i + 1] - categories[i]);
                }
                if (
                  lowPlotLineValue !== 0 &&
                  midPlotLineValue !== 0 &&
                  highPlotLineValue !== 0 &&
                  settlePlotLineValue !== 0
                ) {
                  break;
                }
              }

              ///////////////////////
              //////Add Plot Lines///
              ///////////////////////
              if (lowPlotLineEnabled)
                this.xAxis[0].addPlotLine({
                  //   color: "#1E7B7A",
                  color: "rgb(255,0,0,0.5)",
                  dashStyle: "ShortDash",
                  value: lowPlotLineValue,
                  width: 2,
                  id: "low",
                  zIndex: 2,
                });
              if (highPlotLineEnabled)
                this.xAxis[0].addPlotLine({
                  color: "#007BB5",
                  dashStyle: "ShortDash",

                  value: highPlotLineValue,
                  width: 2.5,
                  id: "high",
                  zIndex: 2,
                });
              if (settlePlotLineEnabled)
                this.xAxis[0].addPlotLine({
                  color: "grey",
                  //   dashStyle: "ShortDash",

                  value: settlePlotLineValue,
                  width: 2,
                  id: "settle",
                  zIndex: 2,
                });

              this.xAxis[0].addPlotLine({
                color: "rgba(215,193,136,0.62)",

                value: midPlotLineValue,
                width: 3,
                id: "mid",
                zIndex: 2,
              });
              ///////////////////////
              ///YES and NO Labels///
              ///////////////////////
              if (width >= 370) {
                const annLabelFontSize = Math.min(
                  Math.max(10, (width / 100) * 1.9),
                  14
                );
                this.addAnnotation({
                  labelOptions: {
                    overflow: "allow",
                    y: -10,
                    shape: "rect",
                    borderColor: "transparent",
                    backgroundColor:
                      theme === 1
                        ? "rgba(148,148,148,0.07)"
                        : [3].includes(theme)
                        ? "transparent"
                        : "rgba(76,191,229,0.07)",
                    style: {
                      height: "2px",
                      clipPath: [1, 2].includes(theme)
                        ? "inset(2px 1.5px 3.5px 0px round 4px)"
                        : isChrome
                        ? "inset(4.5px 1.5px 3px 0px round 4px)"
                        : "inset(5.5px 1.5px 3px 0px round 4px)",
                      maxHeight: "2px",
                      fontSize: `${annLabelFontSize}pt`,
                    },
                  },
                  shapeOptions: {
                    type: "circle",
                    r: 4,
                    strokeWidth: 0,
                  },
                  labels: [
                    {
                      useHTML: true,
                      text: `<span style="fontSize: ${annLabelFontSize}pt; ${
                        theme === 1 ? "color:#D93123" : ""
                      }" }>No/</span><span style=" fontSize: ${Math.max(
                        9.5,
                        annLabelFontSize - 2
                      )}pt"}>Put</span>`,
                      align: "center",
                      point: {
                        y: this.yAxis[0].getExtremes().max / 2,
                        x:
                          categories.length < 3
                            ? this.xAxis[0].getExtremes().max + 0.45
                            : categories.length < 5
                            ? this.xAxis[0].getExtremes().max + 0.4
                            : categories.length < 7
                            ? this.xAxis[0].getExtremes().max + 0.35
                            : this.xAxis[0].getExtremes().max + 0.3,
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
                      useHTML: true,
                      text: `<span style="fontSize: ${annLabelFontSize}pt; ${
                        theme === 1 ? "color:#129047;" : ""
                      }" }>Yes/</span><span style=" fontSize: ${Math.max(
                        9.5,
                        annLabelFontSize - 2
                      )}pt"}>Call</span>`,

                      align: "center",

                      point: {
                        y: -this.yAxis[0].getExtremes().max / 2,
                        x:
                          categories.length < 3
                            ? this.xAxis[0].getExtremes().max + 0.45
                            : categories.length < 5
                            ? this.xAxis[0].getExtremes().max + 0.4
                            : categories.length < 7
                            ? this.xAxis[0].getExtremes().max + 0.35
                            : this.xAxis[0].getExtremes().max + 0.3,
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
                        fontWeight: "700",
                      },
                    },
                  ],

                  //////////////////////////////
                  //////////////////////////////
                  ////Plotline marker circles///
                  //////////////////////////////
                  //////////////////////////////
                  shapes: [
                    {
                      point: lowPlotLineEnabled
                        ? {
                            y: 20,
                            x: lowPlotLineValue,
                            yAxis: 0,
                            xAxis: 0,
                          }
                        : undefined,
                      //   fill: "rgb(0,111,255,0.5)", //006FFF
                      fill: "rgb(182,31,61,0.25)", //D70001
                    },
                    {
                      point: highPlotLineEnabled
                        ? {
                            y: -20,
                            cy: 10,
                            x: highPlotLineValue,
                            yAxis: 0,
                            xAxis: 0,
                          }
                        : undefined,
                      fill: "blue",
                    },
                  ],
                  draggable: "",
                  crop: false,
                });
              }
            } catch {}
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
            if (chart.QSLogo) {
              chart.QSLogo.destroy();
            }
            if (chart.coBrandLogo) {
              chart.coBrandLogo.destroy();
            }

            // Create groups
            if (loadSpinnerRef.current?.style?.visibility === "hidden") {
              chart.QSLogo = renderer.g("QSLogo").add();
              console.log(chart.plotBox);
              chart.renderer
                .image(
                  [1, 2].includes(theme)
                    ? QSIconLight
                    : theme === 3
                    ? QSIconDark
                    : QSIcon,
                  chart.plotBox.x,
                  40,
                  50,
                  50
                )
                .add(chart.QSLogo);

              if (coBrandLogoID === 1) {
                chart.coBrandLogo = renderer.g("coBrandLogo").add();
                console.log(chart.plotBox);
                chart.renderer
                  .image(
                    PYTLogo,
                    chart.plotBox.width,
                    chart.plotBox.height - 15,
                    50,
                    50
                  )
                  .add(chart.coBrandLogo);
              }

              if (width < 250 || height < 200) {
                chart.QSLogo.destroy();
                if (chart.coBrandLogo) {
                  chart.coBrandLogo.destroy();
                }
              }
            }
          },
          load() {
            // try {
            //   let chart = this;
            //   chart.stockTools.showhideBtn.click();
            // } catch {}
          },
        },
      },

      tooltip: {
        formatter: function () {
          let val = "";
          if (this.series.name === "Call") {
            val =
              barLabelType === "Premium"
                ? Math.abs(this.y)
                : barLabelType === "Volume"
                ? callVols[this.point.index]
                : barLabelType === "Probability"
                ? callProbabilities[this.point.index]
                : barLabelType === "Change %"
                ? callChgs[this.point.index]
                : barLabelType === "Max Profit"
                ? callMaxProfits[this.point.index]
                : Math.abs(this.y);
          } else {
            val =
              barLabelType === "Premium"
                ? Math.abs(this.y)
                : barLabelType === "Volume"
                ? putVols[this.point.index]
                : barLabelType === "Probability"
                ? putProbabilities[this.point.index]
                : barLabelType === "Change %"
                ? putChgs[this.point.index]
                : barLabelType === "Max Profit"
                ? putMaxProfits[this.point.index]
                : Math.abs(this.y);
          }
          return `<span style="font-size:10px">${this.x}</span><br/><span style="color:${this.series.color}">● </span>${this.series.name}: <b> ${val} `;
        },
        shadow: [1, 2].includes(theme) ? false : true,
        backgroundColor: "transparent",
        style: {
          color: [1, 2].includes(theme) ? "#181818" : "#F0F0F0",
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
          borderRadius: 2,
          groupPadding:
            categories.length > 18
              ? 0.2
              : categories.length > 15
              ? 0.1625
              : 0.1325,
          borderWidth: 0,
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
            // {
            //   point: {
            //     y: -20,
            //     x: allData.Futures === undefined ? 0 : allData.Futures[0].Low,
            //     yAxis: 0,
            //     xAxis: 0,
            //   },
            //   fill: "blue",
            // },
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
        text: allData.Futures === undefined ? sym : `${sym}`,
        align: "left",
        style: {
          color: [1, 2].includes(theme) ? "#3E4444" : "#E0E0E3",
          textTransform: "uppercase",
          fontSize: "16.5px",
        },
      },
      navigation: {
        buttonOptions: {
          symbolStroke: [1, 2].includes(theme) ? "#2C2C2D" : "#DDDDDD",
          theme: {
            fill: [1, 2].includes(theme) ? "transparent" : "#505053",
            states: {
              hover: {
                fill: [1, 2].includes(theme)
                  ? "rgba(112,112,112,0.2)"
                  : "#707073",
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
          labels: {
            style: {
              fontSize: "0.75em",
              fontWeight: isChrome ? "525" : "500",
              color: [1, 2].includes(theme) ? "#3E4444" : "#E0E0E3",
            },
            step: 1,
          },
          gridLineWidth: 1,
          gridLineColor:
            theme === 0
              ? "rgba(164,164,166,0.2)"
              : [1, 2].includes(theme)
              ? "rgba(63,64,64,0.1)"
              : "#444444",

          lineColor: "#707073",
          minorGridLineWidth: 1,
          tickmarkPlacement: "on",
          minorGridLineColor: "#505053",
          tickColor: "#707073",
          title: {
            style: {
              color: "#A0A0A3",
            },
          },

          categories: categories,
          reversed: false,
          accessibility: {
            description: "call",
          },
        },
        {
          gridLineColor: "#444",
          labels: {
            style: {
              fontSize: "0.75em",
              fontWeight: isChrome ? "525" : "500",

              color: [1, 2].includes(theme) ? "#3E4444" : "#E0E0E3",
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
        // stackLabels: {
        //   enabled: true, // Enable stack labels
        //   verticalAlign: "middle",
        // },
        gridLineColor:
          theme === 1
            ? "#3E4444"
            : theme === 2
            ? "rgba(91,100,100,0.8)"
            : theme === 3
            ? "rgba(224,224,224,0.8)"
            : "rgba(188,188,188,0.9)",

        crosshair: {
          label: {
            backgroundColor: "rgba(0, 0, 0, 0.60)",
          },
        },
        lineColor: "#707073",
        minorGridLineColor: "#505053",
        tickColor: "transparent",
        tickWidth: 1,
        lineWidth: 1,

        // margin: -80,
        title: {
          margin: 4,
          //   offset: -50,
          style: {
            // margin: "0",

            // bottom: "-10px",
            color: [1, 2].includes(theme) ? "#3E4444" : "#CBCBCD",
            // color: "white",
            fontWeight: "500",
          },
          text: "Premium ($)",
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
          distance: 7,
          padding: 0,
          //   x: 10,

          style: {
            color: [1, 2].includes(theme) ? "#3E4444" : "white",
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
              let val =
                barLabelType === "Premium"
                  ? Math.abs(this.y)
                  : barLabelType === "Volume"
                  ? callVols[this.point.index]
                  : barLabelType === "Probability"
                  ? callProbabilities[this.point.index]
                  : barLabelType === "Change %"
                  ? callChgs[this.point.index]
                  : barLabelType === "Max Profit"
                  ? callMaxProfits[this.point.index]
                  : Math.abs(this.y);
              if (
                (val === 0 || val === Number.MIN_VALUE) &&
                barLabelType === "Premium"
              ) {
                return "";
              } else {
                return val;
              }
            },

            padding: 4,
            // backgroundColor: "blue",
            // borderWidth: 2,
            animation: {
              defer: 2000,
            },
            verticalAlign: "middle",
            style: {
              alpha: "0.5",

              color:
                isSafari && theme === 1
                  ? "rgba(0,0,0,0.55)"
                  : [1, 2].includes(theme)
                  ? "#474B49"
                  : "#E9E9E9",

              fontSize: "0.75em",

              strokeWidth: "0.25px",
              fontWeight: isChrome ? "525" : "500",
              // fontWeight:
              //   theme === 0
              //     ? "525"
              //     : [1, 2].includes(theme)
              //     ? "600"
              //     : isChrome
              //     ? "550"
              //     : "500",
              textOutline:
                theme === 3
                  ? "#C4C4C4"
                  : theme === 0
                  ? "#C4C4C4"
                  : "rgb(0,0,0,0.5)",
              //   fontStyle: "italic",
            },
            enabled: true,
            align: "right",
            x: theme === 2 ? -1 : -1,
            y: isSafari ? -0.75 : -1,
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
            padding: 4,
            formatter: function () {
              let val =
                barLabelType === "Premium"
                  ? Math.abs(this.y)
                  : barLabelType === "Volume"
                  ? putVols[this.point.index]
                  : barLabelType === "Probability"
                  ? putProbabilities[this.point.index]
                  : barLabelType === "Change %"
                  ? putChgs[this.point.index]
                  : barLabelType === "Max Profit"
                  ? putMaxProfits[this.point.index]
                  : Math.abs(this.y);
              if (val === 0 && barLabelType === "Premium") {
                return "";
              } else {
                return val;
              }
            },
            // y: -1,
            style: {
              color: theme === 1 ? "black" : theme === 2 ? "black" : "#D4D4D4",
              fontSize: "0.75em",
              strokeWidth: isSafari
                ? "0.25px"
                : theme === 2
                ? "0.25px"
                : theme === 2
                ? "0.25"
                : "0.5px",

              fontWeight: isChrome ? "525" : "500",

              // fontWeight:
              //   theme === 0
              //     ? isChrome
              //       ? "550"
              //       : "525"
              //     : theme === 2
              //     ? "555"
              //     : theme === 1
              //     ? "550"
              //     : "500",

              textOutline:
                theme === 1
                  ? "rgb(0,0,0,0.5)"
                  : theme === 2
                  ? "rgb(0,0,0,0.5)"
                  : theme === 3
                  ? "#C4C4C4"
                  : "#C4C4C4",
              //   fontStyle: "italic",
            },
            align: "left",
            x: 1,
            y: isSafari ? -0.75 : -1,
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
  }, [options, callData, chartRef.current, isMobile, barLabelType]);

  const filterStrikes = (strikes, curPrice) => {
    let filteredStrikes = strikes;

    const highPt =
      filteredStrikes.indexOf(
        filteredStrikes.find((strike) => strike.StrikePrice > curPrice)
      ) + strikeRange;
    const lowPt =
      filteredStrikes.indexOf(
        filteredStrikes.find((strike) => strike.StrikePrice > curPrice)
      ) -
      1 -
      strikeRange;

    if (highPt - lowPt < 2) {
      return filteredStrikes;
    }

    let includeExtraStrikeAboveOrAtATM =
      filteredStrikes[highPt].StrikePrice - curPrice <
      curPrice - filteredStrikes[lowPt].StrikePrice;

    filteredStrikes = filteredStrikes.filter((strike, i) => {
      if (includeExtraStrikeAboveOrAtATM) return i < highPt + 1 && i > lowPt;
      else return i < highPt && i > lowPt - 1;
    });
    return filteredStrikes;
  };

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
      `https://quikoptions.info/api/eventConData?eventConDataProdSym=${sym}`,
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

        if (response.data.Symbol === undefined) {
          setCallData("noneAvail");
        } else {
          //   setCategories(response.data.map((strike) => strike.StrikePrice));
          //   setCallData(response.data.map((strike) => strike.CallPrice * -1));
          //   setPutData(response.data.map((strike) => strike.PutPrice));

          const curPrice = response.data.Futures[0].Mid;
          const settlePrice = response.data.Futures[0].Settle;
          const strikes = response.data.Futures[0].Expirations[0].Strikes;
          const filteredStrikes = filterStrikes(strikes, curPrice);
          let callPremiums = filteredStrikes.map(
            (strike) =>
              (strike.Call.Ask !== null
                ? strike.Call.Ask
                : strike.Call.Bid !== null
                ? strike.Call.Bid
                : Number.MIN_VALUE) * -1 //make zeros values appear on left side of the 0 on y axis with stacking and all
          );
          if (callPremiums.every((val) => val === Number.MIN_VALUE * -1)) {
            callPremiums = callPremiums.map(() => 0.0);
          }
          const putPremiums = filteredStrikes.map((strike) =>
            strike.Put.Ask !== null
              ? strike.Put.Ask
              : strike.Put.Bid !== null
              ? strike.Put.Bid
              : 0.0
          );

          setCategories(filteredStrikes.map((strike) => strike.StrikePrice));

          /////////////
          //CALL DATA//
          //CALL DATA//
          //CALL DATA//
          //CALL DATA//
          //CALL DATA//
          /////////////
          setCallData(callPremiums);
          console.log(callPremiums);
          setCallVols(filteredStrikes.map((strike) => strike.Call.TotalVolume));
          setCallProbabilities(
            callPremiums.map(
              (premium) => `${Math.round(Math.abs(premium * 5))}%`
            )
          );
          setCallChgs(
            filteredStrikes.map(
              (strike) =>
                `${(
                  ((strike.StrikePrice - settlePrice) / settlePrice) *
                  100
                ).toFixed(1)}%`
            )
          );
          setCallMaxProfits(
            callPremiums.map((premium) => Math.abs(20 - premium))
          );

          ////////////
          //PUT DATA//
          //PUT DATA//
          //PUT DATA//
          //PUT DATA//
          //PUT DATA//
          ////////////
          setPutData(putPremiums);
          setPutVols(filteredStrikes.map((strike) => strike.Put.TotalVolume));
          setPutProbabilities(
            putPremiums.map((premium) => `${Math.round(premium * 5)}%`)
          );
          setPutChgs(
            filteredStrikes.map(
              (strike) =>
                `${(
                  ((strike.StrikePrice - settlePrice) / settlePrice) *
                  100
                ).toFixed(1)}%`
            )
          );
          setPutMaxProfits(
            putPremiums.map((premium) => Math.abs(20 - premium))
          );
        }

        //   calldata = [];

        setOptions();
      } catch {
        // console.log(data);
      }
      try {
        expButtonsRef.current.__forceSmoothScrollPolyfill__ = true;
        expButtonsRef.current.scrollTo(0, 0);
      } catch {}
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshSwitch]);

  return (
    <div
      className={`${
        isChrome
          ? "eventConDivChrome"
          : isSafari
          ? "eventConDivSafari"
          : isFirefox
          ? "eventConDivFirefox"
          : "eventConDivSafari"
      }${
        theme === 1
          ? " light"
          : theme === 2
          ? " light2"
          : theme === 3
          ? " dark"
          : ""
      }`}
      style={{
        display: "block",

        width: `${width}px`,
        height: `${height}px`,
      }}
    >
      {/* "#42B39A",
        "#02757D",
        "#46947a", "#075645"*/}
      <div
        style={{
          //   border: "1px solid green",
          borderTop: "1px solid green",
          borderRadius: "2.5px",
          borderBottom: theme === 3 ? "0.5px inset #B2B2B2" : "",
          borderRight: theme === 3 ? "0.5px solid #B2B2B2" : "",

          borderLeft: theme === 3 ? "0.5px solid #B2B2B2" : "",

          background:
            theme === 1
              ? // ? "linear-gradient(60deg,  #E3E7F2 2%,#EFEFEF 5%,#EFEFEF 95%, #E3E7F2 97%)"
                //   "linear-gradient(60deg, #F7F7F7 1%, #E3E3E3 3%, #E3E3E3 20%,#F7F7F7 40%, #F7F7F7 60%, #E3E3E3 80%,#E3E3E3 96%, #F7F7F7 99%)"
                "linear-gradient(90deg, #CCD9DC,#EEF2F1)"
              : theme === 3
              ? "linear-gradient(90deg,  #444E4C 0%,#415652 25%,#666F68 50%, #666F68 50%,#415652 75%,#444E4C 100%)"
              : "linear-gradient(60deg,  #075645,#46947a, #075645)",
          marginLeft: !isChrome && theme === 3 ? "0px" : "",
          width: `${
            width -
            ((isChrome && theme !== 3) || (isFirefox && theme === 3) ? 4 : 3)
          }px`,
          height: `${30}px`,
          display: "flex",
          flexDirection: "row",

          flexWrap: "wrap",
          justifyContent: "left",
          alignItems: "center",
          //   borderBottom: "1px inset blue",
        }}
      >
        <div
          style={{
            // verticalAlign: "middle",
            fontWeight: "450",
            marginLeft: "2px",
            width: "fit-content",
            flex: "0 1 0",
            whiteSpace: "nowrap",
          }}
        >
          {allData.Futures === undefined ? (
            ""
          ) : (
            <div>
              <span
                style={{
                  color: theme === 1 ? "#3E4444" : "white",
                  fontWeight: "500",
                }}
              >{`${allData.Futures[0].Symbol}`}</span>
              <span
                style={{ color: theme === 1 ? "#3E4444" : "white" }}
              >{` @ ${allData.Futures[0].Last}`}</span>
              <span> (</span>
              <span
                style={{
                  color:
                    allData.Futures[0].Last - allData.Futures[0].Settle > 0
                      ? theme === 1
                        ? "#15AB54"
                        : "#84CD85"
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
        {width >= 450 ? (
          allData.Futures === undefined ? (
            <></>
          ) : (
            <BarLabelButtons
              theme={theme}
              width={width}
              barLabelType={barLabelType}
              setBarLabelType={setBarLabelType}
            />
          )
        ) : allData.Futures === undefined ? (
          <></>
        ) : (
          <BarLabelDropdown
            theme={theme}
            width={width}
            barLabelType={barLabelType}
            setBarLabelType={setBarLabelType}
          />
        )}
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
