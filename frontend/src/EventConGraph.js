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
import QSIcon from "./graphQS.png";
import { useParams, useSearchParams } from "react-router-dom";
import { useMediaQuery } from "react-responsive";
import DropdownButton from "react-bootstrap/DropdownButton";
import { NavDropdown, Dropdown } from "react-bootstrap";
import { ExclamationTriangle } from "react-bootstrap-icons";
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

  const [data, setData] = useState([
    [1609560063, 0, 0, 0, 0, 0],
    [
      Date.parse(new Date().toUTCString()) -
        new Date(new Date().toUTCString() + " UTC").getTimezoneOffset() * 60000,
      0,
      0,
      0,
      0,
      0,
    ],
  ]);

  const [groupingUnits, setGroupingUnits] = useState();

  const [options, setOptions] = useState();

  //used to store top right expiry buttons` DOM node and programatically scroll to left 0 on render
  const expButtonsRef = useRef(null);

  //SET HIGHCHARTS OPTIONS
  useEffect(() => {
    console.log(
      searchParams.get("sym"),
      width,
      height,
      searchParams.toString()
    );
    try {
      if (data.includes("noneAvail"))
        containerRef.current.style.opacity = "0.6";
    } catch {}
    Highcharts.setOptions({
      lang: {
        decimalPoint: ".",
        thousandsSep: ",",
      },
    });
    chartRef.current = Highcharts.stockChart(containerRef.current, {
      chartType: "stock",
      navigator: {
        enabled: false,
        handles: !props.lightMode
          ? {
              backgroundColor: "#666",
              borderColor: "#AAA",
            }
          : {},

        outlineColor: !props.lightMode ? "#CCC" : "#cccccc",
        maskFill: "rgba(255,255,255,0.1)",
        xAxis: {
          //   type: "categories",

          //   categories: data.map((d, i) => data[i][0]),
          gridLineColor: !props.lightMode ? "#505053" : "#e6e6e6",
          dateTimeLabelFormats: {
            month: "%b %e, %Y",
            week: "%b %e, %Y",
            day: "%b %e",
            hour: "%l %P",
            minute: "%l:%M %P",
          },
        },
        series: {
          color: !props.lightMode ? "#7798BF" : undefined,
          lineColor: "#A6C7ED",
          type: "line",
        },
      },
      drilldown: {
        activeAxisLabelStyle: {
          color: !props.lightMode ? "#F0F0F3" : "#003399",
        },
        activeDataLabelStyle: {
          color: !props.lightMode ? "#F0F0F3" : "#003399",
        },
      },
      navigation: {
        buttonOptions: {
          symbolStroke: !props.lightMode ? "#DDDDDD" : "#666666",
          theme: {
            fill: !props.lightMode ? "#505053" : {},
            states: {
              hover: {
                fill: !props.lightMode ? "#707073" : {},
              },
              select: {
                fill: !props.lightMode ? "#707073" : {},
              },
            },
          },
        },
        bindingsClassName: "tools-container", // informs Stock Tools where to look for HTML elements for adding technical indicators, annotations etc.
      },
      stockTools: {
        gui: {
          enabled: isMobile ? false : true, // disable the built-in toolbar
          buttons: [
            "fullScreen",
            "currentPriceIndicator",
            "typeChange",
            "separator",

            "indicators",
            "simpleShapes",
            "lines",
            "crookedLines",
            "measure",
            "advanced",
            "toggleAnnotations",
            "separator",
            "verticalLabels",
            "flags",
            "separator",
            "zoomChange",

            "separator",
            "saveChart",
          ],
        },
      },
      legend: isMobile
        ? {
            itemHoverStyle: {
              color: !props.lightMode ? "#FFF" : {},
            },
            itemHiddenStyle: {
              color: !props.lightMode ? "#606063" : {},
            },
            title: {
              style: {
                color: !props.lightMode ? "#C0C0C0" : {},
              },
            },
            itemStyle: {
              color: !props.lightMode ? "#E0E0E3" : {},

              fontSize: "11px",
              fontWeight: "normal",
            },
            padding: 6,
            margin: 8,
            enabled: true,
          }
        : {
            width:
              props.EODSummaryType ===
                "CallYTDVol, CallYTDADV, CallADV, CallVol, PutYTDVol, PutYTDADV, PutADV, PutVol" ||
              props.EODSummaryType === "FutYTDVol" ||
              props.EODSummaryType === "FutYTDADV"
                ? 500
                : 500,

            itemHoverStyle: {
              color: !props.lightMode ? "#FFF" : {},
            },
            itemHiddenStyle: {
              color: !props.lightMode ? "#606063" : {},
            },
            title: {
              style: {
                color: !props.lightMode ? "#C0C0C0" : {},
              },
            },

            itemStyle: {
              //   textOverflow: null,
              //   width: 60, // or whatever
              color: !props.lightMode ? "#E0E0E3" : {},
              fontSize: "11px",
              fontWeight: "normal",
            },
            padding: 6,
            margin: 8,
            align: "right",
            verticalAlign: "top",
            y: -115,
            x: -25,
            enabled: true,
          },
      chart: {
        width: width,
        height: height,
        zoomType: "x",
        panning: true,

        panKey: "shift",
        type: "column",
        marginTop: 0,
        marginBottom: 50,
        backgroundColor: !props.lightMode
          ? {
              linearGradient: { x1: 0, y1: 0, x2: 1, y2: 1 },
              stops: [
                [0, "rgb(30,38,50)"],
                [1, "rgb(56,70,86)"],
              ],
            }
          : "white",

        borderColor: !props.lightMode ? "#606063" : {},
        plotBorderColor: !props.lightMode ? "#606063" : {},
        borderWidth: 1,
        // height: 550,
        events: {
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
              .image(QSIcon, chart.plotLeft + chart.plotSizeX - 75, 75, 50, 50)
              .add(chart.customImgGroup);
          },
          load() {
            if (!isMobile) {
              let chart = this;
              chart.stockTools.showhideBtn.click();
            }
          },

          selection: function () {
            var ch = this;
            zoomButton.current = ch.renderer
              .button(
                "Reset zoom",
                null,
                null,
                function () {
                  ch.xAxis[0].setExtremes(null, null);
                },
                {
                  zIndex: 20,
                }
              )
              .attr({
                id: "resetZoom",
                align: "right",
                title: "Reset zoom level 1:1",
              })
              .add()
              .align(
                {
                  align: "right",
                  x: -15,
                  y: 40,
                },
                false,
                null
              );
          },
        },
      },
      labels: {
        style: !props.lightMode
          ? {
              color: "#707073",
            }
          : {},
      },

      plotOptions: {
        series: {
          dataLabels: {
            color: !props.lightMode ? "#F0F0F3" : {},
            style: {
              fontSize: "13px",
            },
          },
          marker: !props.lightMode
            ? {
                lineColor: "#333",
              }
            : {},
          turboThreshold: 10000,
          dataGrouping: {
            enabled: false,
          },
          states: {
            hover: { enabled: data.includes("noneAvail") ? false : true },

            inactive: {
              opacity: 1,
            },
          },
        },
        boxplot: {
          fillColor: !props.lightMode ? "#505053" : {},
        },
        candlestick: {
          maxPointWidth: 25,

          lineColor: !props.lightMode ? "white" : "black",
        },
        errorbar: {
          color: !props.lightMode ? "white" : {},
        },
        line: {
          lineWidth: 1,
        },
        ohlc: {
          maxPointWidth: 25,
        },
        column: {
          maxPointWidth: 25,
          stacking:
            props.EODSummaryType === "CallADV, PutADV, FutADV" ||
            props.EODSummaryType ===
              "CallYTDVol, CallYTDADV, CallADV, CallVol, PutYTDVol, PutYTDADV, PutADV, PutVol"
              ? "normal"
              : "normal",
          //   dataLabels: {
          //     enabled: true,
          //   },
        },
      },
      scrollbar: !props.lightMode
        ? {
            barBackgroundColor: "#808083",
            barBorderColor: "#808083",
            buttonArrowColor: "#CCC",
            buttonBackgroundColor: "#606063",
            buttonBorderColor: "#606063",
            rifleColor: "#FFF",
            trackBackgroundColor: "#404043",
            trackBorderColor: "#404043",
          }
        : {},
      rangeSelector: {
        buttonTheme: !props.lightMode
          ? {
              fill: "rgb(44,56,72)",
              stroke: "#000000",
              style: {
                color: "#ccc",
              },
              states: {
                hover: {
                  fill: "#707073",
                  stroke: "#000000",
                  style: {
                    color: "white",
                  },
                },
                select: {
                  fill: "#000003",
                  stroke: "#000000",
                  style: {
                    color: "white",
                  },
                },
                disabled: {
                  fill: "#999",
                  style: {
                    color: "#bbb",
                  },
                },
              },
            }
          : {},
        inputStyle: !props.lightMode
          ? {
              backgroundColor: "#333",
              color: "silver",
            }
          : {},
        labelStyle: {
          color: !props.lightMode ? "silver" : {},
        },
        selected: 5,
        enabled: true,
        inputEnabled:
          isMobile ||
          props.EODSummaryType === "FutYTDVol" ||
          props.EODSummaryType === "FutYTDADV"
            ? false
            : true,
        allButtonsEnabled: true,
        verticalAlign: "top",
        dropdown: isMobile ? "never" : "responsive",
        x: isMobile ? 0 : 0,
        y: 0,
        inputPosition: isMobile
          ? {
              x: 0,
              y: 0,
            }
          : {},
        height: 75,

        buttons: [
          {
            type: "month",
            count: 1,
            text: "1m",
          },
          {
            type: "month",
            count: 3,
            text: "3m",
          },
          {
            type: "month",
            count: 6,
            text: "6m",
          },
          {
            type: "ytd",
            text: "YTD",
          },
          {
            type: "year",
            count: 1,
            text: "1y",
          },
          {
            type: "all",
            text: "All",
          },
        ],
      },

      title: {
        text:
          props.EODSummaryType === "FutADV & FutOpnInt"
            ? props.prodName + " Monthly Fut ADV and OI"
            : props.EODSummaryType === "CallADV, PutADV, FutADV"
            ? props.prodName + " Monthly Option ADV"
            : props.EODSummaryType ===
              "CallOpenInt, PutOpenInt, CallVol, PutVol"
            ? props.prodName + " Monthly OI & Vol"
            : props.EODSummaryType ===
              "OICallChg, OIPutChg, CallVolChg, PutVolChg"
            ? props.prodName + " Monthly OI & Vol Chg"
            : props.EODSummaryType === "FutYTDVol"
            ? props.prodName + " Year Over Year Monthly Volume"
            : props.EODSummaryType === "FutYTDADV"
            ? props.prodName + " Year Over Year Monthly ADV"
            : props.EODSummaryType ===
              "CallYTDVol, CallYTDADV, CallADV, CallVol, PutYTDVol, PutYTDADV, PutADV, PutVol"
            ? props.prodName + " Monthly YTD Vol & ADV"
            : "",
        align: "left",
        style: {
          color: !props.lightMode ? "#E0E0E3" : {},
          textTransform: "uppercase",
          fontSize: "16px",
        },
      },
      subtitle: {
        style: {
          color: !props.lightMode ? "#E0E0E3" : {},
          textTransform: "uppercase",
        },
      },
      xAxis: {
        events: {
          setExtremes: function (event) {
            if (
              (!event.min && !event.max) ||
              (event.min === event.dataMin && event.max === event.dataMax) ||
              event.rangeSelectorButton?.text === "All"
            ) {
              try {
                zoomButton.current.destroy();
              } catch {}
            }
          },
        },

        minRange: 1,
        startOnTick: true,
        showLastLabel: true,

        gridLineColor: !props.lightMode ? "#444" : "#e6e6e6",
        // offset: 150,
        type: "datetime",
        labels: {
          step: 1,
          style: {
            color: !props.lightMode ? "#E0E0E3" : {},
          },
        },
        lineColor: !props.lightMode ? "#707073" : {},
        minorGridLineColor: !props.lightMode ? "#505053" : "#f2f2f2",
        tickColor: !props.lightMode ? "#707073" : {},
        title: {
          style: {
            color: !props.lightMode ? "#A0A0A3" : {},
          },
        },
        dateTimeLabelFormats: {
          month:
            props.EODSummaryType === "FutYTDVol" ||
            props.EODSummaryType === "FutYTDADV"
              ? "%b<br/>"
              : "%b<br/>%Y",
          week:
            props.EODSummaryType === "FutYTDVol" ||
            props.EODSummaryType === "FutYTDADV"
              ? "%b %e<br/>"
              : "%b %e<br/>%Y",
          day: "%b %e",
          hour: "%l %P",
          minute: "%l:%M %P",
          second: "%l:%M:%S %P",
          millisecond: "%l:%M:%S %P",
        },

        gridLineWidth: 1,
      },
      yAxis:
        props.EODSummaryType === "FutADV & FutOpnInt"
          ? [
              {
                showEmpty: false,

                endOnTick: true,
                gridLineColor: !props.lightMode ? "#707073" : "#e6e6e6",
                lineColor: !props.lightMode ? "#707073" : "#ccd6eb",
                minorGridLineColor: !props.lightMode ? "#505053" : "#f2f2f2",
                tickColor: !props.lightMode ? "#707073" : "#ccd6eb",
                crosshair: {
                  snap: false,
                  label: {
                    padding: 4,
                  },
                },
                labels: {
                  align: "right",
                  x: -3,
                  style: {
                    color: !props.lightMode ? "#E0E0E3" : {},
                  },
                },
                title: {
                  text: "Fut ADV",
                  style: {
                    color: !props.lightMode ? "#A0A0A3" : {},
                  },
                },
                height: "65%",
                lineWidth: 1,
                resize: {
                  enabled: true,
                },
                top: "0%",
              },
              {
                showEmpty: false,

                gridLineColor: !props.lightMode ? "#707073" : {},
                lineColor: !props.lightMode ? "#707073" : {},
                minorGridLineColor: !props.lightMode ? "#505053" : {},
                tickColor: !props.lightMode ? "#707073" : {},
                crosshair: {
                  snap: false,
                  label: {
                    padding: 4,
                  },
                },
                labels: {
                  align: "right",
                  x: -3,
                  style: {
                    color: !props.lightMode ? "#E0E0E3" : {},
                  },
                },
                title: {
                  text: "Fut OI",
                  style: {
                    color: !props.lightMode ? "#A0A0A3" : {},
                  },
                },
                top: "65%",
                height: "35%",
                offset: 0,
                lineWidth: 1,
              },
            ]
          : props.EODSummaryType === "CallADV, PutADV, FutADV"
          ? [
              {
                showEmpty: false,

                endOnTick: true,
                gridLineColor: !props.lightMode ? "#707073" : "#e6e6e6",
                lineColor: !props.lightMode ? "#707073" : "#ccd6eb",
                minorGridLineColor: !props.lightMode ? "#505053" : "#f2f2f2",
                tickColor: !props.lightMode ? "#707073" : "#ccd6eb",
                crosshair: {
                  snap: false,
                  label: {
                    padding: 4,
                  },
                },
                labels: {
                  align: "right",
                  x: -3,
                  style: {
                    color: !props.lightMode ? "#E0E0E3" : {},
                  },
                },
                title: {
                  text: "Option ADV",
                  style: {
                    color: !props.lightMode ? "#A0A0A3" : {},
                  },
                },
                height: "65%",
                lineWidth: 1,
                resize: {
                  enabled: true,
                },
                top: "0%",
              },
              {
                showEmpty: false,

                gridLineColor: !props.lightMode ? "#707073" : {},
                lineColor: !props.lightMode ? "#707073" : {},
                minorGridLineColor: !props.lightMode ? "#505053" : {},
                tickColor: !props.lightMode ? "#707073" : {},
                crosshair: {
                  snap: false,
                  label: {
                    padding: 4,
                  },
                },
                labels: {
                  align: "right",
                  x: -3,
                  style: {
                    color: !props.lightMode ? "#E0E0E3" : {},
                  },
                },
                title: {
                  text: "Fut ADV",
                  style: {
                    color: !props.lightMode ? "#A0A0A3" : {},
                  },
                },
                top: "65%",
                height: "35%",
                offset: 0,
                lineWidth: 1,
              },
            ]
          : props.EODSummaryType === "CallOpenInt, PutOpenInt, CallVol, PutVol"
          ? [
              {
                showEmpty: false,

                endOnTick: true,
                gridLineColor: !props.lightMode ? "#707073" : "#e6e6e6",
                lineColor: !props.lightMode ? "#707073" : "#ccd6eb",
                minorGridLineColor: !props.lightMode ? "#505053" : "#f2f2f2",
                tickColor: !props.lightMode ? "#707073" : "#ccd6eb",
                crosshair: {
                  snap: false,
                  label: {
                    padding: 4,
                  },
                },
                labels: {
                  align: "right",
                  x: -3,
                  style: {
                    color: !props.lightMode ? "#E0E0E3" : {},
                  },
                },
                title: {
                  text: "Open Interest",
                  style: {
                    color: !props.lightMode ? "#A0A0A3" : {},
                  },
                },
                height: "50%",
                lineWidth: 1,
                resize: {
                  enabled: true,
                },
                top: "0%",
              },
              {
                showEmpty: false,

                gridLineColor: !props.lightMode ? "#707073" : {},
                lineColor: !props.lightMode ? "#707073" : {},
                minorGridLineColor: !props.lightMode ? "#505053" : {},
                tickColor: !props.lightMode ? "#707073" : {},
                crosshair: {
                  snap: false,
                  label: {
                    padding: 4,
                  },
                },
                labels: {
                  align: "right",
                  x: -3,
                  style: {
                    color: !props.lightMode ? "#E0E0E3" : {},
                  },
                },
                title: {
                  text: "Volume",
                  style: {
                    color: !props.lightMode ? "#A0A0A3" : {},
                  },
                },
                top: "50%",
                height: "50%",
                offset: 0,
                lineWidth: 1,
              },
            ]
          : props.EODSummaryType ===
            "OICallChg, OIPutChg, CallVolChg, PutVolChg"
          ? [
              {
                showEmpty: false,

                endOnTick: true,
                gridLineColor: !props.lightMode ? "#707073" : "#e6e6e6",
                lineColor: !props.lightMode ? "#707073" : "#ccd6eb",
                minorGridLineColor: !props.lightMode ? "#505053" : "#f2f2f2",
                tickColor: !props.lightMode ? "#707073" : "#ccd6eb",
                crosshair: {
                  snap: false,
                  label: {
                    padding: 4,
                  },
                },
                labels: {
                  align: "right",
                  x: -3,
                  style: {
                    color: !props.lightMode ? "#E0E0E3" : {},
                  },
                },
                title: {
                  text: "OI Chg",
                  style: {
                    color: !props.lightMode ? "#A0A0A3" : {},
                  },
                },
                height: "50%",
                lineWidth: 1,
                resize: {
                  enabled: true,
                },
                top: "0%",
              },
              {
                showEmpty: false,

                gridLineColor: !props.lightMode ? "#707073" : {},
                lineColor: !props.lightMode ? "#707073" : {},
                minorGridLineColor: !props.lightMode ? "#505053" : {},
                tickColor: !props.lightMode ? "#707073" : {},
                crosshair: {
                  snap: false,
                  label: {
                    padding: 4,
                  },
                },
                labels: {
                  align: "right",
                  x: -3,
                  style: {
                    color: !props.lightMode ? "#E0E0E3" : {},
                  },
                },
                title: {
                  text: "Vol Chg",
                  style: {
                    color: !props.lightMode ? "#A0A0A3" : {},
                  },
                },
                top: "50%",
                height: "50%",
                offset: 0,
                lineWidth: 1,
              },
            ]
          : props.EODSummaryType === "FutYTDVol"
          ? [
              {
                showEmpty: false,

                endOnTick: true,
                gridLineColor: !props.lightMode ? "#707073" : "#e6e6e6",
                lineColor: !props.lightMode ? "#707073" : "#ccd6eb",
                minorGridLineColor: !props.lightMode ? "#505053" : "#f2f2f2",
                tickColor: !props.lightMode ? "#707073" : "#ccd6eb",
                crosshair: {
                  snap: false,
                  label: {
                    padding: 4,
                  },
                },
                labels: {
                  align: "right",
                  x: -3,
                  style: {
                    color: !props.lightMode ? "#E0E0E3" : {},
                  },
                },
                title: {
                  text: "YTD Vol",
                  style: {
                    color: !props.lightMode ? "#A0A0A3" : {},
                  },
                },
                height: "100%",
                lineWidth: 1,
                resize: {
                  enabled: true,
                },
                top: "0%",
              },
            ]
          : props.EODSummaryType === "FutYTDADV"
          ? [
              {
                showEmpty: false,

                endOnTick: true,
                gridLineColor: !props.lightMode ? "#707073" : "#e6e6e6",
                lineColor: !props.lightMode ? "#707073" : "#ccd6eb",
                minorGridLineColor: !props.lightMode ? "#505053" : "#f2f2f2",
                tickColor: !props.lightMode ? "#707073" : "#ccd6eb",
                crosshair: {
                  snap: false,
                  label: {
                    padding: 4,
                  },
                },
                labels: {
                  align: "right",
                  x: -3,
                  style: {
                    color: !props.lightMode ? "#E0E0E3" : {},
                  },
                },
                title: {
                  text: "YTD ADV",
                  style: {
                    color: !props.lightMode ? "#A0A0A3" : {},
                  },
                },
                height: "100%",
                lineWidth: 1,
                resize: {
                  enabled: true,
                },
                top: "0%",
              },
            ]
          : props.EODSummaryType ===
            "CallYTDVol, CallYTDADV, CallADV, CallVol, PutYTDVol, PutYTDADV, PutADV, PutVol"
          ? [
              {
                showEmpty: false,

                endOnTick: true,
                gridLineColor: !props.lightMode ? "#707073" : "#e6e6e6",
                lineColor: !props.lightMode ? "#707073" : "#ccd6eb",
                minorGridLineColor: !props.lightMode ? "#505053" : "#f2f2f2",
                tickColor: !props.lightMode ? "#707073" : "#ccd6eb",
                crosshair: {
                  snap: false,
                  label: {
                    padding: 4,
                  },
                },
                labels: {
                  align: "right",
                  x: -3,
                  style: {
                    color: !props.lightMode ? "#E0E0E3" : {},
                  },
                },
                title: {
                  text: "Call Vol",
                  style: {
                    color: !props.lightMode ? "#A0A0A3" : {},
                  },
                },
                height: "35%",
                lineWidth: 1,
                resize: {
                  enabled: true,
                },
                top: "0%",
              },
              {
                showEmpty: false,

                gridLineColor: !props.lightMode ? "#707073" : {},
                lineColor: !props.lightMode ? "#707073" : {},
                minorGridLineColor: !props.lightMode ? "#505053" : {},
                tickColor: !props.lightMode ? "#707073" : {},
                crosshair: {
                  snap: false,
                  label: {
                    padding: 4,
                  },
                },
                labels: {
                  align: "right",
                  x: -3,
                  style: {
                    color: !props.lightMode ? "#E0E0E3" : {},
                  },
                },
                title: {
                  text: "Call ADV",
                  style: {
                    color: !props.lightMode ? "#A0A0A3" : {},
                  },
                },
                top: "35%",
                height: "15%",
                offset: 0,
                lineWidth: 1,
              },
              {
                showEmpty: false,

                gridLineColor: !props.lightMode ? "#707073" : {},
                lineColor: !props.lightMode ? "#707073" : {},
                minorGridLineColor: !props.lightMode ? "#505053" : {},
                tickColor: !props.lightMode ? "#707073" : {},
                crosshair: {
                  snap: false,
                  label: {
                    padding: 4,
                  },
                },
                labels: {
                  align: "right",
                  x: -3,
                  style: {
                    color: !props.lightMode ? "#E0E0E3" : {},
                  },
                },
                title: {
                  text: "Put Vol",
                  style: {
                    color: !props.lightMode ? "#A0A0A3" : {},
                  },
                },
                top: "50%",
                height: "35%",
                offset: 0,
                lineWidth: 1,
              },
              {
                showEmpty: false,

                gridLineColor: !props.lightMode ? "#707073" : {},
                lineColor: !props.lightMode ? "#707073" : {},
                minorGridLineColor: !props.lightMode ? "#505053" : {},
                tickColor: !props.lightMode ? "#707073" : {},
                crosshair: {
                  snap: false,
                  label: {
                    padding: 4,
                  },
                },
                labels: {
                  align: "right",
                  x: -3,
                  style: {
                    color: !props.lightMode ? "#E0E0E3" : {},
                  },
                },
                title: {
                  text: "Put ADV",
                  style: {
                    color: !props.lightMode ? "#A0A0A3" : {},
                  },
                },
                top: "85%",
                height: "15%",
                offset: 0,
                lineWidth: 1,
              },
            ]
          : [
              {
                showEmpty: false,

                endOnTick: true,
                gridLineColor: !props.lightMode ? "#707073" : "#e6e6e6",
                lineColor: !props.lightMode ? "#707073" : "#ccd6eb",
                minorGridLineColor: !props.lightMode ? "#505053" : "#f2f2f2",
                tickColor: !props.lightMode ? "#707073" : "#ccd6eb",
                crosshair: {
                  snap: false,
                  label: {
                    padding: 4,
                  },
                },
                labels: {
                  align: "right",
                  x: -3,
                  style: {
                    color: !props.lightMode ? "#E0E0E3" : {},
                  },
                },
                title: {
                  text: "Call Vol",
                  style: {
                    color: !props.lightMode ? "#A0A0A3" : {},
                  },
                },
                height: "35%",
                lineWidth: 1,
                resize: {
                  enabled: true,
                },
                top: "0%",
              },
              {
                showEmpty: false,

                gridLineColor: !props.lightMode ? "#707073" : {},
                lineColor: !props.lightMode ? "#707073" : {},
                minorGridLineColor: !props.lightMode ? "#505053" : {},
                tickColor: !props.lightMode ? "#707073" : {},
                crosshair: {
                  snap: false,
                  label: {
                    padding: 4,
                  },
                },
                labels: {
                  align: "right",
                  x: -3,
                  style: {
                    color: !props.lightMode ? "#E0E0E3" : {},
                  },
                },
                title: {
                  text: "Call ADV",
                  style: {
                    color: !props.lightMode ? "#A0A0A3" : {},
                  },
                },
                top: "35%",
                height: "15%",
                offset: 0,
                lineWidth: 1,
              },
              {
                showEmpty: false,

                gridLineColor: !props.lightMode ? "#707073" : {},
                lineColor: !props.lightMode ? "#707073" : {},
                minorGridLineColor: !props.lightMode ? "#505053" : {},
                tickColor: !props.lightMode ? "#707073" : {},
                crosshair: {
                  snap: false,
                  label: {
                    padding: 4,
                  },
                },
                labels: {
                  align: "right",
                  x: -3,
                  style: {
                    color: !props.lightMode ? "#E0E0E3" : {},
                  },
                },
                title: {
                  text: "Put Vol",
                  style: {
                    color: !props.lightMode ? "#A0A0A3" : {},
                  },
                },
                top: "50%",
                height: "35%",
                offset: 0,
                lineWidth: 1,
              },
              {
                showEmpty: false,

                gridLineColor: !props.lightMode ? "#707073" : {},
                lineColor: !props.lightMode ? "#707073" : {},
                minorGridLineColor: !props.lightMode ? "#505053" : {},
                tickColor: !props.lightMode ? "#707073" : {},
                crosshair: {
                  snap: false,
                  label: {
                    padding: 4,
                  },
                },
                labels: {
                  align: "right",
                  x: -3,
                  style: {
                    color: !props.lightMode ? "#E0E0E3" : {},
                  },
                },
                title: {
                  text: "Put ADV",
                  style: {
                    color: !props.lightMode ? "#A0A0A3" : {},
                  },
                },
                top: "85%",
                height: "15%",
                offset: 0,
                lineWidth: 1,
              },
            ],

      tooltip: {
        enabled: data.includes("noneAvail") ? false : true,

        shared: true,

        backgroundColor: !props.lightMode
          ? "rgb(95,95,97,0.75)"
          : "rgb(255,255,255,0.75)",
        style: {
          color: !props.lightMode ? "#F0F0F0" : {},
        },
        split: true,
        shape: "square",
        borderWidth: 0,
        shadow: false,
        padding: 3,
        useHTML: true,
        xDateFormat:
          props.EODSummaryType === "FutYTDVol" ||
          props.EODSummaryType === "FutYTDADV"
            ? "%b"
            : "%m/%Y",

        positioner:
          props.EODSummaryType === "FutADV & FutOpnInt"
            ? undefined
            : props.EODSummaryType === "CallADV, PutADV, FutADV"
            ? function (width, height, point) {
                let chart = this.chart;
                let position;
                if (point.isHeader) {
                  position = {
                    x: Math.max(
                      chart.plotLeft,
                      Math.min(
                        point.plotX + chart.plotLeft - width / 2,
                        chart.chartWidth - width - chart.marginRight
                      )
                    ),
                    y: point.plotY,
                  };
                } else if (
                  point.series.name === "Call ADV" ||
                  point.series.name === "Put ADV"
                ) {
                  position = {
                    x: point.series.chart.plotLeft,
                    y: 0,
                  };
                } else if (point.series.name === "Fut ADV") {
                  position = {
                    x: point.series.chart.plotLeft,
                    y: chart.yAxis[1].top - chart.yAxis[1].height + 65,
                  };
                } else {
                  return {
                    x: Math.max(
                      chart.plotLeft,
                      Math.min(
                        point.plotX + chart.plotLeft - width / 2,
                        chart.chartWidth - width - chart.marginRight
                      )
                    ),
                    y: point.plotY - height * 1.5,
                  };
                }
                return position;
              }
            : props.EODSummaryType ===
              "CallOpenInt, PutOpenInt, CallVol, PutVol"
            ? function (width, height, point) {
                let chart = this.chart;
                let position;
                if (point.isHeader) {
                  position = {
                    x: Math.max(
                      chart.plotLeft,
                      Math.min(
                        point.plotX + chart.plotLeft - width / 2,
                        chart.chartWidth - width - chart.marginRight
                      )
                    ),
                    y: point.plotY,
                  };
                } else if (
                  point.series.name === "Call OI" ||
                  point.series.name === "Put OI"
                ) {
                  position = {
                    x: point.series.chart.plotLeft,
                    y: 0,
                  };
                } else if (
                  point.series.name === "Call Vol" ||
                  point.series.name === "Put Vol"
                ) {
                  position = {
                    x: point.series.chart.plotLeft,
                    y: chart.yAxis[1].top - 50,
                  };
                } else {
                  return {
                    x: Math.max(
                      chart.plotLeft,
                      Math.min(
                        point.plotX + chart.plotLeft - width / 2,
                        chart.chartWidth - width - chart.marginRight
                      )
                    ),
                    y: point.plotY - height * 1.5,
                  };
                }
                return position;
              }
            : props.EODSummaryType ===
              "OICallChg, OIPutChg, CallVolChg, PutVolChg"
            ? function (width, height, point) {
                let chart = this.chart;
                let position;
                if (point.isHeader) {
                  position = {
                    x: Math.max(
                      chart.plotLeft,
                      Math.min(
                        point.plotX + chart.plotLeft - width / 2,
                        chart.chartWidth - width - chart.marginRight
                      )
                    ),
                    y: point.plotY,
                  };
                } else if (
                  point.series.name === "Call OI Chg" ||
                  point.series.name === "Put OI Chg"
                ) {
                  position = {
                    x: point.series.chart.plotLeft,
                    y: 0,
                  };
                } else if (
                  point.series.name === "Call Vol Chg" ||
                  point.series.name === "Put Vol Chg"
                ) {
                  position = {
                    x: point.series.chart.plotLeft,
                    y: chart.yAxis[1].top - 50,
                  };
                } else {
                  return {
                    x: Math.max(
                      chart.plotLeft,
                      Math.min(
                        point.plotX + chart.plotLeft - width / 2,
                        chart.chartWidth - width - chart.marginRight
                      )
                    ),
                    y: point.plotY - height * 1.5,
                  };
                }
                return position;
              }
            : props.EODSummaryType === "FutYTDVol"
            ? undefined
            : props.EODSummaryType === "FutYTDADV"
            ? undefined
            : props.EODSummaryType ===
              "CallYTDVol, CallYTDADV, CallADV, CallVol, PutYTDVol, PutYTDADV, PutADV, PutVol"
            ? function (width, height, point) {
                let chart = this.chart;
                let position;
                if (point.isHeader) {
                  position = {
                    x: Math.max(
                      chart.plotLeft,
                      Math.min(
                        point.plotX + chart.plotLeft - width / 2,
                        chart.chartWidth - width - chart.marginRight
                      )
                    ),
                    y: point.plotY,
                  };
                } else if (
                  point.series.name === "Call Vol" ||
                  point.series.name === "Call YTD Vol"
                ) {
                  position = {
                    x: point.series.chart.plotLeft,
                    y: 0,
                  };
                } else if (
                  point.series.name === "Call YTD ADV" ||
                  point.series.name === "Call ADV"
                ) {
                  position = {
                    x: point.series.chart.plotLeft,
                    y: chart.yAxis[1].top - 50,
                  };
                } else if (
                  point.series.name === "Put Vol" ||
                  point.series.name === "Put YTD Vol"
                ) {
                  position = {
                    x: point.series.chart.plotLeft,
                    y: chart.yAxis[2].top - 25,
                  };
                } else if (
                  point.series.name === "Put YTD ADV" ||
                  point.series.name === "Put ADV"
                ) {
                  position = {
                    x: point.series.chart.plotLeft,
                    y: chart.yAxis[3].top - 50,
                  };
                } else {
                  return {
                    x: Math.max(
                      chart.plotLeft,
                      Math.min(
                        point.plotX + chart.plotLeft - width / 2,
                        chart.chartWidth - width - chart.marginRight
                      )
                    ),
                    y: point.plotY - height * 1.5,
                  };
                }
                return position;
              }
            : undefined,

        //   let chart = this.chart;
        //   let position;
        //   if (point.isHeader) {
        //     position = {
        //       x: Math.max(
        //         chart.plotLeft,
        //         Math.min(
        //           point.plotX + chart.plotLeft - width / 2,
        //           chart.chartWidth - width - chart.marginRight
        //         )
        //       ),
        //       y: point.plotY,
        //     };
        //   } else if (
        //     point.series.name === "Future Volume" ||
        //     point.series.name === "Future Volume Chg" ||
        //     point.series.name === "Call Volume" ||
        //     point.series.name === "Put Volume" ||
        //     point.series.name === "Call Volume Chg" ||
        //     point.series.name === "Put Volume Chg"
        //   ) {
        //     position = {
        //       x: point.series.chart.plotLeft,
        //       y: 0,
        //     };
        //   } else if (
        //     point.series.name === "Future OI" ||
        //     point.series.name === "Future OI Chg" ||
        //     point.series.name === "Call OI" ||
        //     point.series.name === "Put OI" ||
        //     point.series.name === "Call OI Chg" ||
        //     point.series.name === "Put OI Chg"
        //   ) {
        //     position = {
        //       x: point.series.chart.plotLeft,
        //       y: chart.yAxis[2].top - chart.yAxis[2].height + 48,
        //     };
        //   } else {
        //     return {
        //       x: Math.max(
        //         chart.plotLeft,
        //         Math.min(
        //           point.plotX + chart.plotLeft - width / 2,
        //           chart.chartWidth - width - chart.marginRight
        //         )
        //       ),
        //       y: point.plotY - height * 1.5,
        //     };
        //   }

        //   return position;
        // },
      },
      // corresponding indexes in data array:
      // lM,
      // YR,
      // FutVol, 2
      // FutVolChg, 3
      // FutADV,4
      // FutOpnInt,5
      // OIFutChg,6
      // CallOpenInt7
      // ,PutOpenInt,8
      // OICallChg,9
      // OIPutChg,10
      // CallVolChg,11
      // PutVolChg,12
      // CallVol,13
      // CallADV,14
      // PutVol 15
      // ,PutADV,16
      // TotVol,17
      // TotADV,18
      // FutYTDVol 19
      // ,FutYTDADV,20
      // CallYTDVol 21
      // ,CallYTDADV,22
      // PutYTDVol 23
      // ,PutYTDADV 24

      series:
        props.EODSummaryType === "FutADV & FutOpnInt"
          ? [
              {
                type: "column",
                name: "Future ADV",
                data: !data.includes("noneAvail")
                  ? data.map((d, i) => [data[i][0], data[i][5]])
                  : [0, 0, 0, 0, 0],

                color: props.lightMode ? undefined : "#4a68b5",
                borderColor: "white",
                borderWidth: props.lightMode ? undefined : "0.5",
                borderRadius: props.lightMode ? "0" : "1",
                dataGrouping: {
                  enabled: groupingUnits,
                },
              },

              {
                type: "column",
                name: "Future OI",
                data: !data.includes("noneAvail")
                  ? data.map((d, i) => [data[i][0], data[i][1]])
                  : [0, 0, 0, 0, 0],
                yAxis: 1,

                borderColor: "white",
                borderWidth: props.lightMode ? undefined : "0.1",
                borderRadius: props.lightMode ? "0" : "1",
                dataGrouping: {
                  enabled: groupingUnits,
                },
              },
            ]
          : props.EODSummaryType === "CallADV, PutADV, FutADV"
          ? [
              {
                type: "column",
                name: "Call ADV",
                data: !data.includes("noneAvail")
                  ? data.map((d, i) => [data[i][0], data[i][15]])
                  : [0, 0, 0, 0, 0],
                color: "#7A9FCC",
                borderColor: "white",
                borderWidth: props.lightMode ? undefined : "0.5",
                borderRadius: props.lightMode ? "0" : "1",
                yAxis: 0,
                dataGrouping: {
                  enabled: groupingUnits,
                },
              },
              {
                type: "column",
                name: "Put ADV",
                data: !data.includes("noneAvail")
                  ? data.map((d, i) => [data[i][0], data[i][17]])
                  : [0, 0, 0, 0, 0],
                color: "#A6861E",
                yAxis: 0,
                borderColor: "white",
                borderWidth: props.lightMode ? undefined : "0.5",
                borderRadius: props.lightMode ? "0" : "1",
                dataGrouping: {
                  enabled: groupingUnits,
                },
              },
              {
                type: "column",
                name: "Fut ADV",
                data: !data.includes("noneAvail")
                  ? data.map((d, i) => [data[i][0], data[i][5]])
                  : [0, 0, 0, 0, 0],
                color: "#4E5A85",
                borderColor: "white",
                borderWidth: "0.5",
                yAxis: 1,
                dataGrouping: {
                  enabled: groupingUnits,
                },
              },
            ]
          : props.EODSummaryType === "CallOpenInt, PutOpenInt, CallVol, PutVol"
          ? [
              {
                type: "column",
                name: "Call OI",
                data: !data.includes("noneAvail")
                  ? data.map((d, i) => [data[i][0], data[i][8]])
                  : [0, 0, 0, 0, 0],
                color: "#7A9FCC",
                borderColor: "white",
                borderWidth: props.lightMode ? undefined : "0.5",
                borderRadius: props.lightMode ? "0" : "1",
                yAxis: 0,
                dataGrouping: {
                  enabled: groupingUnits,
                },
              },
              {
                type: "column",
                name: "Put OI",
                data: !data.includes("noneAvail")
                  ? data.map((d, i) => [data[i][0], data[i][9]])
                  : [0, 0, 0, 0, 0],
                color: "#A48308",
                yAxis: 0,
                borderColor: "white",
                borderWidth: props.lightMode ? undefined : "0.5",
                borderRadius: props.lightMode ? "0" : "1",
                dataGrouping: {
                  enabled: groupingUnits,
                },
              },
              {
                type: "column",
                name: "Call Vol",
                data: !data.includes("noneAvail")
                  ? data.map((d, i) => [data[i][0], data[i][14]])
                  : [0, 0, 0, 0, 0],
                color: "rgb(137,188,233)",
                borderColor: "white",
                borderWidth: "0.5",
                yAxis: 1,
                dataGrouping: {
                  enabled: groupingUnits,
                },
              },
              {
                type: "column",
                name: "Put Vol",
                data: !data.includes("noneAvail")
                  ? data.map((d, i) => [data[i][0], data[i][16]])
                  : [0, 0, 0, 0, 0],
                yAxis: 1,

                color: "#A6861E",
                borderColor: "white",
                borderWidth: props.lightMode ? undefined : "0.5",
                borderRadius: props.lightMode ? "0" : "1",
                dataGrouping: {
                  enabled: groupingUnits,
                },
              },
            ]
          : props.EODSummaryType ===
            "OICallChg, OIPutChg, CallVolChg, PutVolChg"
          ? [
              {
                type: "line",
                name: "Call OI Chg",
                data: !data.includes("noneAvail")
                  ? data.map((d, i) => [data[i][0], data[i][10]])
                  : [0, 0, 0, 0, 0],
                color: "rgb(137,188,233)",
                borderColor: "white",
                borderWidth: props.lightMode ? undefined : "0.5",
                borderRadius: props.lightMode ? "0" : "1",
                yAxis: 0,
                dataGrouping: {
                  enabled: groupingUnits,
                },
              },
              {
                type: "line",
                name: "Put OI Chg",
                data: !data.includes("noneAvail")
                  ? data.map((d, i) => [data[i][0], data[i][11]])
                  : [0, 0, 0, 0, 0],
                color: "#A48308",
                yAxis: 0,
                borderColor: "white",
                borderWidth: props.lightMode ? undefined : "0.5",
                borderRadius: props.lightMode ? "0" : "1",
                dataGrouping: {
                  enabled: groupingUnits,
                },
              },
              {
                type: "line",
                name: "Call Vol Chg",
                data: !data.includes("noneAvail")
                  ? data.map((d, i) => [data[i][0], data[i][12]])
                  : [0, 0, 0, 0, 0],
                color: "rgb(137,188,233)",
                borderColor: "white",
                borderWidth: "0.5",
                yAxis: 1,
                dataGrouping: {
                  enabled: groupingUnits,
                },
              },
              {
                type: "line",
                name: "Put Vol Chg",
                data: !data.includes("noneAvail")
                  ? data.map((d, i) => [data[i][0], data[i][13]])
                  : [0, 0, 0, 0, 0],
                yAxis: 1,

                color: "#A6861E",
                borderColor: "white",
                borderWidth: props.lightMode ? undefined : "0.5",
                borderRadius: props.lightMode ? "0" : "1",
                dataGrouping: {
                  enabled: groupingUnits,
                },
              },
            ]
          : props.EODSummaryType === "FutYTDVol"
          ? data
              .reduce((result, month, i) => {
                if (i === 0) {
                  result.push([]);
                  result[result.length - 1].push(month);
                } else if (
                  new Date(month[0]).toString().slice(11, 15) !==
                  new Date(data[i - 1][0]).toString().slice(11, 15)
                ) {
                  //comparing years to determine series groupings
                  result.push([]);
                  result[result.length - 1].push(month);
                } else {
                  result[result.length - 1].push(month);
                }
                return result;
              }, [])
              .map((year, i) => {
                return {
                  type: "line",
                  name: `${new Date(year[0][0])
                    .toString()
                    .slice(11, 15)} YTD Vol`,
                  data: year.map((month, i) => {
                    const xDate = new Date(month[0]);
                    xDate.setFullYear(1970);
                    return [Date.parse(xDate), month[6]];
                  }),
                  yAxis: 0,
                  marker: {
                    enabled: true,
                    radius: 2,
                  },
                  color: `hsl(${
                    210 + i * 20 < 360
                      ? 210 + i * 20
                      : 210 + i * 20 > 360
                      ? 210 - i * 20
                      : 200
                  }, 72%, ${
                    210 + i * 20 < 360 || 210 + i * 20 > 360 ? 57 - i * 3 : 57
                  }%`,
                  borderColor: "white",
                  borderWidth: props.lightMode ? undefined : "0.5",
                  borderRadius: props.lightMode ? "0" : "1",
                  dataGrouping: {
                    enabled: groupingUnits,
                  },
                };
              })
          : props.EODSummaryType === "FutYTDADV"
          ? data
              .reduce((result, month, i) => {
                if (i === 0) {
                  result.push([]);
                  result[result.length - 1].push(month);
                } else if (
                  new Date(month[0]).toString().slice(11, 15) !==
                  new Date(data[i - 1][0]).toString().slice(11, 15)
                ) {
                  //comparing years to determine series groupings
                  result.push([]);
                  result[result.length - 1].push(month);
                } else {
                  result[result.length - 1].push(month);
                }
                return result;
              }, [])
              .map((year, i) => {
                return {
                  type: "line",
                  name: `${new Date(year[0][0])
                    .toString()
                    .slice(11, 15)} YTD ADV`,
                  data: year.map((month, i) => {
                    const xDate = new Date(month[0]);
                    xDate.setFullYear(1970);
                    return [Date.parse(xDate), month[7]];
                  }),
                  yAxis: 0,
                  marker: {
                    enabled: true,
                    radius: 2,
                  },
                  color: `hsl(${
                    210 + i * 20 < 360
                      ? 210 + i * 20
                      : 210 + i * 20 > 360
                      ? 210 - i * 20
                      : 200
                  }, 72%, ${
                    210 + i * 20 < 360 || 210 + i * 20 > 360 ? 57 - i * 3 : 57
                  }%`,
                  borderColor: "white",
                  borderWidth: props.lightMode ? undefined : "0.5",
                  borderRadius: props.lightMode ? "0" : "1",
                  dataGrouping: {
                    enabled: groupingUnits,
                  },
                };
              })
          : props.EODSummaryType ===
            "CallYTDVol, CallYTDADV, CallADV, CallVol, PutYTDVol, PutYTDADV, PutADV, PutVol"
          ? [
              {
                type: "column",
                name: "Call Vol",
                data: !data.includes("noneAvail")
                  ? data.map((d, i) => [data[i][0], data[i][14]])
                  : [0, 0, 0, 0, 0],
                color: "rgb(137,188,233)",
                borderColor: "white",
                borderWidth: props.lightMode ? undefined : "0.5",
                borderRadius: props.lightMode ? "0" : "1",
                yAxis: 0,
                dataGrouping: {
                  enabled: groupingUnits,
                },
              },
              {
                type: "column",
                name: "Call YTD Vol",
                data: !data.includes("noneAvail")
                  ? data.map((d, i) => [data[i][0], data[i][18]])
                  : [0, 0, 0, 0, 0],
                color: "#5B81CC",
                yAxis: 0,
                borderColor: "white",
                borderWidth: props.lightMode ? undefined : "0.5",
                borderRadius: props.lightMode ? "0" : "1",
                dataGrouping: {
                  enabled: groupingUnits,
                },
              },
              {
                type: "spline",
                name: "Call ADV",
                data: !data.includes("noneAvail")
                  ? data.map((d, i) => [data[i][0], data[i][15]])
                  : [0, 0, 0, 0, 0],
                yAxis: 1,

                color: "#8F213B",
                borderColor: "white",
                borderWidth: props.lightMode ? undefined : "0.5",
                borderRadius: props.lightMode ? "0" : "1",
                dataGrouping: {
                  enabled: groupingUnits,
                },
              },
              {
                type: "spline",
                name: "Call YTD ADV",
                data: !data.includes("noneAvail")
                  ? data.map((d, i) => [data[i][0], data[i][19]])
                  : [0, 0, 0, 0, 0],
                color: "#525DA3",
                borderColor: "white",
                borderWidth: "0.5",
                yAxis: 1,
                dataGrouping: {
                  enabled: groupingUnits,
                },
              },

              {
                type: "column",
                name: "Put Vol",
                data: !data.includes("noneAvail")
                  ? data.map((d, i) => [data[i][0], data[i][16]])
                  : [0, 0, 0, 0, 0],
                color: "#E8BC57",
                borderColor: "white",
                borderWidth: props.lightMode ? undefined : "0.5",
                borderRadius: props.lightMode ? "0" : "1",
                yAxis: 2,
                dataGrouping: {
                  enabled: groupingUnits,
                },
              },
              {
                type: "column",
                name: "Put YTD Vol",
                data: !data.includes("noneAvail")
                  ? data.map((d, i) => [data[i][0], data[i][20]])
                  : [0, 0, 0, 0, 0],
                color: "#997C1C",
                yAxis: 2,
                borderColor: "white",
                borderWidth: props.lightMode ? undefined : "0.5",
                borderRadius: props.lightMode ? "0" : "1",
                dataGrouping: {
                  enabled: groupingUnits,
                },
              },
              {
                type: "spline",
                name: "Put ADV",
                data: !data.includes("noneAvail")
                  ? data.map((d, i) => [data[i][0], data[i][17]])
                  : [0, 0, 0, 0, 0],
                color: "#8F213B",

                borderColor: "white",
                borderWidth: "0.5",
                yAxis: 3,
                dataGrouping: {
                  enabled: groupingUnits,
                },
              },
              {
                type: "spline",
                name: "Put YTD ADV",
                data: !data.includes("noneAvail")
                  ? data.map((d, i) => [data[i][0], data[i][21]])
                  : [0, 0, 0, 0, 0],
                yAxis: 3,
                color: "#525DA3",

                borderColor: "white",
                borderWidth: props.lightMode ? undefined : "0.5",
                borderRadius: props.lightMode ? "0" : "1",
                dataGrouping: {
                  enabled: groupingUnits,
                },
              },
            ]
          : [
              {
                type: "column",
                name: "Call Vol",
                data: !data.includes("noneAvail")
                  ? data.map((d, i) => [data[i][0], data[i][14]])
                  : [0, 0, 0, 0, 0],
                color: "rgb(137,188,233)",
                borderColor: "white",
                borderWidth: props.lightMode ? undefined : "0.5",
                borderRadius: props.lightMode ? "0" : "1",
                yAxis: 0,
                dataGrouping: {
                  enabled: groupingUnits,
                },
              },
              {
                type: "column",
                name: "Call YTD Vol",
                data: !data.includes("noneAvail")
                  ? data.map((d, i) => [data[i][0], data[i][18]])
                  : [0, 0, 0, 0, 0],
                color: "#5B81CC",
                yAxis: 0,
                borderColor: "white",
                borderWidth: props.lightMode ? undefined : "0.5",
                borderRadius: props.lightMode ? "0" : "1",
                dataGrouping: {
                  enabled: groupingUnits,
                },
              },
              {
                type: "spline",
                name: "Call ADV",
                data: !data.includes("noneAvail")
                  ? data.map((d, i) => [data[i][0], data[i][15]])
                  : [0, 0, 0, 0, 0],
                yAxis: 1,

                color: "#8F213B",
                borderColor: "white",
                borderWidth: props.lightMode ? undefined : "0.5",
                borderRadius: props.lightMode ? "0" : "1",
                dataGrouping: {
                  enabled: groupingUnits,
                },
              },
              {
                type: "spline",
                name: "Call YTD ADV",
                data: !data.includes("noneAvail")
                  ? data.map((d, i) => [data[i][0], data[i][19]])
                  : [0, 0, 0, 0, 0],
                color: "#525DA3",
                borderColor: "white",
                borderWidth: "0.5",
                yAxis: 1,
                dataGrouping: {
                  enabled: groupingUnits,
                },
              },

              {
                type: "column",
                name: "Put Vol",
                data: !data.includes("noneAvail")
                  ? data.map((d, i) => [data[i][0], data[i][16]])
                  : [0, 0, 0, 0, 0],
                color: "#E8BC57",
                borderColor: "white",
                borderWidth: props.lightMode ? undefined : "0.5",
                borderRadius: props.lightMode ? "0" : "1",
                yAxis: 2,
                dataGrouping: {
                  enabled: groupingUnits,
                },
              },
              {
                type: "column",
                name: "Put YTD Vol",
                data: !data.includes("noneAvail")
                  ? data.map((d, i) => [data[i][0], data[i][20]])
                  : [0, 0, 0, 0, 0],
                color: "#997C1C",
                yAxis: 2,
                borderColor: "white",
                borderWidth: props.lightMode ? undefined : "0.5",
                borderRadius: props.lightMode ? "0" : "1",
                dataGrouping: {
                  enabled: groupingUnits,
                },
              },
              {
                type: "spline",
                name: "Put ADV",
                data: !data.includes("noneAvail")
                  ? data.map((d, i) => [data[i][0], data[i][17]])
                  : [0, 0, 0, 0, 0],
                color: "#8F213B",

                borderColor: "white",
                borderWidth: "0.5",
                yAxis: 3,
                dataGrouping: {
                  enabled: groupingUnits,
                },
              },
              {
                type: "spline",
                name: "Put YTD ADV",
                data: !data.includes("noneAvail")
                  ? data.map((d, i) => [data[i][0], data[i][21]])
                  : [0, 0, 0, 0, 0],
                yAxis: 3,
                color: "#525DA3",

                borderColor: "white",
                borderWidth: props.lightMode ? undefined : "0.5",
                borderRadius: props.lightMode ? "0" : "1",
                dataGrouping: {
                  enabled: groupingUnits,
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
  }, [options, data, chartRef.current, isMobile]);

  useEffect(() => {
    setData([]);
    try {
      loadSpinnerRef.current.style.animationFillMode = "forwards";
      loadSpinnerRef.current.style.visibility = "visible";
      loadSpinnerRef.current.style.opacity = "1";
      containerRef.current.style.opacity = data.includes("noneAvail")
        ? "0.6"
        : "0.9";
    } catch {}

    axios(
      process.env.NODE_ENV === "production"
        ? `https://quikoptions.info/api/EODSummaryData?EODSummaryDataProdSym=${sym}`
        : `https://quikoptions.info/api/EODSummaryData?EODSummaryDataProdSym=${sym}`
    ).then((response) => {
      console.log(response.data);

      try {
        containerRef.current.style.opacity = data.includes("noneAvail")
          ? "0.6"
          : "1";

        loadSpinnerRef.current.style.visibility = "hidden";
        loadSpinnerRef.current.style.opacity = "0";

        if (response.data.includes("AVAIL") || response.data.length === 0) {
          console.log("!");
          setTimeout(() => setData([0, "noneAvail"]), 0);
          noneAvailRef.current.style.animationFillMode = "forwards";
          noneAvailRef.current.style.visibility = "visible";
          noneAvailRef.current.style.opacity = "0.75";
          containerRef.current.style.opacity = "0.6";
        } else {
          try {
            containerRef.current.style.opacity = "0.9";
          } catch {}

          setData(
            response.data.map(
              ({
                YM,
                FutOpnInt,
                OIFutChg,
                FutVolChg,
                FutVol,
                FutADV,
                FutYTDVol,
                FutYTDADV,
                CallOpenInt,
                PutOpenInt,
                OICallChg,
                OIPutChg,
                CallVolChg,
                PutVolChg,
                CallVol,
                CallADV,
                PutVol,
                PutADV,
                CallYTDVol,
                CallYTDADV,
                PutYTDVol,
                PutYTDADV,
              }) => [
                Date.parse(`${YM.slice(-2)}/01/${YM.slice(0, 4)}`),
                FutOpnInt === "NaN" || isNaN(FutOpnInt)
                  ? null
                  : parseFloat(FutOpnInt),
                OIFutChg === "NaN" || isNaN(OIFutChg)
                  ? null
                  : parseFloat(OIFutChg),
                FutVolChg === "NaN" || isNaN(FutVolChg)
                  ? null
                  : parseFloat(FutVolChg),
                FutVol === "NaN" || isNaN(FutVol) ? null : parseFloat(FutVol),
                FutADV === "NaN" || isNaN(FutADV) ? null : parseFloat(FutADV), //cv5
                FutYTDVol === "NaN" || isNaN(FutYTDVol)
                  ? null
                  : parseFloat(FutYTDVol), //pv6
                FutYTDADV === "NaN" || isNaN(FutYTDADV) //cvc7
                  ? null
                  : parseFloat(FutYTDADV),
                CallOpenInt === "NaN" || isNaN(CallOpenInt) //pvc8
                  ? null
                  : parseFloat(CallOpenInt),
                PutOpenInt === "NaN" || isNaN(PutOpenInt)
                  ? null
                  : parseFloat(PutOpenInt), //coi9
                OICallChg === "NaN" || isNaN(OICallChg)
                  ? null
                  : parseFloat(OICallChg), //poi10
                OIPutChg === "NaN" || isNaN(OIPutChg) //coic11
                  ? null
                  : parseFloat(OIPutChg),
                CallVolChg === "NaN" || isNaN(CallVolChg) //poic12
                  ? null
                  : parseFloat(CallVolChg),
                PutVolChg === "NaN" || isNaN(PutVolChg) //poic12
                  ? null
                  : parseFloat(PutVolChg),
                CallVol === "NaN" || isNaN(CallVol) //poic12
                  ? null
                  : parseFloat(CallVol),
                CallADV === "NaN" || isNaN(CallADV) //poic12
                  ? null
                  : parseFloat(CallADV),
                PutVol === "NaN" || isNaN(PutVol) //poic12
                  ? null
                  : parseFloat(PutVol),
                PutADV === "NaN" || isNaN(PutADV) //poic12
                  ? null
                  : parseFloat(PutADV),
                CallYTDVol === "NaN" || isNaN(CallYTDVol) //poic12
                  ? null
                  : parseFloat(CallYTDVol),
                CallYTDADV === "NaN" || isNaN(CallYTDADV) //poic12
                  ? null
                  : parseFloat(CallYTDADV),
                PutYTDVol === "NaN" || isNaN(PutYTDVol) //poic12
                  ? null
                  : parseFloat(PutYTDVol),
                PutYTDADV === "NaN" || isNaN(PutYTDADV) //poic12
                  ? null
                  : parseFloat(PutYTDADV),
                // OpnInt === "NaN" || isNaN(OpnInt) ? null : parseFloat(OpnInt),
                // Volume === "NaN" || isNaN(Volume) ? null : parseFloat(Volume),
              ]
            )
          );
        }
        setGroupingUnits([
          [
            "week", // unit name
            [1], // allowed multiples
          ],
          ["month", [1, 2, 3, 4, 6]],
        ]);
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
  }, [props.prodName]);

  return (
    <div style={{ background: !props.lightMode && "rgb(47,54.5,70.5)" }}>
      {props.symSwitchEnabled ? (
        <div
          style={{
            // position: "absolute",
            right: "0%",
            // transform: "translate(0,-100%)",
            zIndex: "2",
            fontSize: "0.9em",
            color: "white",
            textAlign: "center",
            width: "100%",

            // window.innerWidth < 1500 ? "1390px" : window.innerWidth - 50,
            whiteSpace: "nowrap",
            overflow: "visible",
            // right:"100%",
            display: "inline-flex",
          }}
        >
          <span
            style={{
              fontSize: "9px",
              marginLeft: "0.5rem",
              marginRight: "0.5rem",
              marginBottom: "0",
              padding: "0",
              height: "fit-content",
              transform: "translate(0px,0.2rem)",
              borderRadius: "2px",
              background: "blue",
              textAlign: "center",
              display: props.symButtonStripLabel === undefined && "none",
              backgroundColor: props.lightMode ? "" : "rgba(99, 111, 135,0.8)",
              color: props.lightMode ? "black" : "white",
            }}
          >
            <>&nbsp;</>
            {`${props.symButtonStripLabel} Symbols:`}
            <>&nbsp;</>
          </span>
          <div
            className="expButtons"
            id="expButtons"
            style={{
              marginLeft: "auto",
              scrollbarWidth: "none",
              // background: `linear-gradient(to right, transparent 29vw, ${
              //   props.lightMode
              //     ? "rgb(255, 255, 255)"
              //     : "rgba(255,255,255,0.4)"
              // })`,
              overflow: "scroll",
              width: "100%",
              textAlign: "right",
            }}
          >
            <div
              ref={expButtonsRef}
              className="expButtons"
              id="expButtons"
              style={{
                scrollBehavior: "smooth",
                scrollbarWidth: "none",
                marginLeft: "auto",
                background: `linear-gradient(to right, transparent 95%, ${
                  props.lightMode
                    ? "rgb(255, 255, 255)"
                    : "rgba(255,255,255,0.4)"
                })`,
                overflow: "scroll",
                width: "100%",
                textAlign: "left",
              }}
            >
              {/* <ExpiryFutSymbolButton
                lightMode={props.lightMode}
                onClick={undefined}
                expSymbol={props.prodCode}
                currentlySelected={true}
              /> */}
              {props.marketData
                .filter((symDetails) => symDetails.ProdName !== props.prodName)
                .map((symDetails) => {
                  // console.log(symDetails);
                  return (
                    // <ExpiryFutSymbolButton
                    //   lightMode={props.lightMode}
                    //   onClick={() => {
                    //     props.setGraphProps({
                    //       EODSummaryProdName: symDetails.ProdName,
                    //       EODSummaryProdCode: ProdNameToSym(
                    //         symDetails.ProdName,
                    //         false,
                    //         true
                    //       ),
                    //       // symDetails.ProdName.substring(

                    //       //   symDetails.ProdName.indexOf("(") + 1,
                    //       //   symDetails.ProdName.indexOf(")")
                    //       // )
                    //       EODSummaryType: props.EODSummaryType,
                    //     });
                    //   }}
                    //   expSymbol={
                    //     ProdNameToSym(symDetails.ProdName, false, true)
                    //     // symDetails.ProdName.split("(")[1].substring(
                    //     // 0,
                    //     // symDetails.ProdName.split("(")[1].indexOf(")")
                    //     // )
                    //   }
                    // />
                    <></>
                  );
                })}
            </div>
          </div>
        </div>
      ) : (
        <></>
      )}
      {data.includes("noneAvail") ? (
        <div
          ref={noneAvailRef}
          style={{
            transition: "all 0.25s ease",
            position: "absolute",
            fontSize: "1vw",
            left: "45%",
            bottom: "50%",
            zIndex: "100",
            transform: "scale(3.5,3.5)",
            display: "table-row-group",

            color: props.lightMode ? "black" : "rgba(176, 192, 209,0.3)",
          }}
        >
          <div
            style={{
              transform: "translate(112.5%,-40%) scale(2.5,2.5)",
              opacity: "0.55",
            }}
          >
            <ExclamationTriangle sz="lg" />
          </div>
          Plot Unavailable
        </div>
      ) : (
        <>
          <div
            ref={loadSpinnerRef}
            style={{
              transition: "all 0.25s ease",
              position: "absolute",
              left: "50%",
              bottom: "50%",
              zIndex: "100",
              transform: "scale(3.5,3.5)",
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
