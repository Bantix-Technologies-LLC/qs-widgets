import { isChrome, isFirefox, isSafari } from "react-device-detect";
import Highcharts from "highcharts/highstock";
import QSIcon from "./QSIconDark3.png";

const EventConGraphDarkOptions = (
  sym,
  width,
  height,
  allData,
  categories,
  callData,
  putData,
  containerRef
) => {
  return;
  Highcharts.chart(containerRef.current, {
    chartType: "bar",
    colors: [
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
      width: width,
      height: height - 31,

      marginTop: 42,
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
        redraw() {},
        render: function () {
          try {
            var lowPlotLineValue = 0,
              midPlotLineValue = 0,
              highPlotLineValue = 0;

            var lowPlotLineEnabled = allData.Futures[0].Low > categories[0];
            var highPlotLineEnabled =
              allData.Futures[0].High < categories[categories.length - 1];

            for (let i = 0; i < categories.length - 1; i++) {
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
            if (lowPlotLineEnabled)
              this.xAxis[0].addPlotLine({
                color: "#1E7B7A",
                dashStyle: "ShortDash",
                value: lowPlotLineValue,
                width: 2.5,
                id: "low",
              });
            if (highPlotLineEnabled)
              this.xAxis[0].addPlotLine({
                color: "#007BB5",
                dashStyle: "ShortDash",

                value: highPlotLineValue,
                width: 2.5,
                id: "high",
              });
            this.xAxis[0].addPlotLine({
              color: "rgba(215,193,136,0.5)",

              value: midPlotLineValue,
              width: 3,
              id: "mid",
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
                  backgroundColor: "rgba(76,191,229,0.07)",
                  style: {
                    height: "2px",
                    clipPath: isChrome
                      ? "inset(4.5px 1.5px 3px 0px round 4px)"
                      : "inset(5.5px 1.5px 3px 0px round 4px)",
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
                    fill: "rgb(0,111,255,0.5)",
                  },
                  {
                    point: highPlotLineEnabled
                      ? {
                          y: -20,
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
              document.getElementsByClassName("highcharts-data-table")[0].style
                .display !== "none"
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
          // try {
          //   let chart = this;
          //   chart.stockTools.showhideBtn.click();
          // } catch {}
        },
      },
    },

    tooltip: {
      formatter: function () {
        return `<span style="font-size:10px">${
          this.x
        }</span><br/><span style="color:${this.series.color}">● </span>${
          this.series.name
        }: <b> ${this.series.name === "Call" ? -this.y : this.y} `;
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
        title: {
          text: "PRemum",
        },
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
        title: {
          text: "PRemum",
        },
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
          color: "#CBCBCD",
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
            alpha: "0.5",

            color: "white",
            fontSize:
              width > 550 || height > 550
                ? "9px"
                : width > 650 || height > 650
                ? "10px"
                : "8px",
            strokeWidth: "0.2px",
            fontWeight: "400",
            //   fontWeight: "bold",
            textOutline: "transparent",
            //   fontStyle: "italic",
          },
          enabled: true,
          align: "right",
          x: -1,
          y: isChrome ? -2 : -1,
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
          y: -2,
          style: {
            color: "#D4D4D4",
            fontSize: "9px",
            strokeWidth: "0px",
            fontWeight: "600",

            //   fontWeight: "bold",
            textOutline: "black",
            //   fontStyle: "italic",
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
              document.getElementsByClassName("highcharts-data-table")[0].style
                .display !== "none"
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
};

export default EventConGraphDarkOptions;
