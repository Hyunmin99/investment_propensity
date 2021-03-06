import React, { useState } from "react";
import FormControl from "@mui/material/FormControl";
import { Box, InputAdornment, Input, MenuItem, Select } from "@mui/material";
import {
  ComposedChart,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  Area,
  Line,
} from "recharts";
import { CompoundContribution } from "../calculate/Calculator";
import {ROUNDTWO, LUMPSUM, MUTUAL} from "../calculate/Formula";


function GBIGraph({ Min, Max, Pro }) {
  //calculate
  let P = 0;
  let PMT = 0;
  //input
  const [Method, setMethod] = useState("LumpSum");
  const [Period, setPeriod] = useState(3);
  const [T, setT] = useState(10000);

  const handleMethod = (event) => {
    setMethod(event.target.value);
  };
  const handlePeriod = (event) => {
    //   if(event.target)
    setPeriod(event.target.value);
  };
  const handleT = (event) => {
    setT(event.target.value);
  };
  const formatYAxis = (tickItem) => {
    let Money = tickItem;

    const units = ["만원", "억원"];
    let unitIndex = 0;

    while (Money >= 10000 && unitIndex < units.length - 1) {
      unitIndex += 1;
      Money /= 10000;
      Money = ROUNDTWO(Money);
    }
    return `${Money.toLocaleString()}${units[unitIndex]}`;
  };
  const formatTooltip = (value, name) => {
    let Money = value;
    let unitIndex = 0;
    const units = ["만원", "억원"];

    if (name === "예상수익범위") {
      const NewValue = value.map((Money) => {
        while (Money >= 10000 && unitIndex < units.length - 1) {
          unitIndex += 1;
          Money /= 10000;
          Money = ROUNDTWO(Money);
        }
        return `${Money.toLocaleString()}${units[unitIndex]}`;
      })
      return [
        `${NewValue[0]} ~ ${NewValue[1]}`,
        "예상수익범위",
      ];
    } else {
      while (Money >= 10000 && unitIndex < units.length - 1) {
        unitIndex += 1;
        Money /= 10000;
        Money = ROUNDTWO(Money);
      }
      return `${Money.toLocaleString()}${units[unitIndex]}`;
    }
  };

  if (Method === "LumpSum") {
    P = LUMPSUM(T, Pro, Period);
    PMT = 0;
  } else if (Method === "Mutual") {
    P = 0;
    PMT = MUTUAL(T, Pro, Period);
  }

  //데이터 세팅
  const Year = Array.from({ length: parseInt(Period) + 1 }, (v, i) => i);

  const data = Year.map(function (t) {
    return CompoundContribution(P, PMT, t, Min, Max, Pro);
  });

  return (
    <div style={{ marginTop: "1rem" }}>
      <h3 style={{ margin: "0.3rem 0" }}>📈 단기 GBI 그래프</h3>
      <div className="Description" style={{ marginTop: "1rem" }}>
        <Box sx={{ display: "flex" }}>
          <FormControl variant="standard">
            <Select
              labelId="year-select-label"
              id="year-select"
              value={Method}
              onChange={handleMethod}
              defaultValue={"거치식"}
            >
              <MenuItem value="LumpSum">거치식</MenuItem>
              <MenuItem value="Mutual">적립식</MenuItem>
            </Select>
          </FormControl>
        </Box>
        <span>으로</span>
        <Box sx={{ display: "flex" }}>
          <FormControl variant="standard">
            <Input
              id="period"
              value={Period}
              onChange={handlePeriod}
              endAdornment={<InputAdornment position="end">년</InputAdornment>}
              size="small"
              sx={{ width: "48px", ml: "0.5rem" }}
            />
          </FormControl>
        </Box>
        <span>동안</span>
        <Box sx={{ display: "flex" }}>
          <FormControl variant="standard">
            <Input
              id="money"
              value={T}
              onChange={handleT}
              endAdornment={
                <InputAdornment position="end">만원</InputAdornment>
              }
              inputProps={{ pattern: "[0-9]*" }}
              //   type="number"
              size="small"
              sx={{ width: "100px", textAlign: "right", ml: "0.5rem" }}
            />
          </FormControl>
        </Box>
        <span>을 모으기 위해...</span>
        <div
          style={{
            backgroundColor: "#F4F3F4",
            width: "100%",
            margin: "1rem 0",
            padding: "0.5rem 1.2rem",
            borderRadius: "0.8rem",
          }}
        >
          {Method === "LumpSum" && (
            <span style={{ marginTop: "0.8rem" }}>
              초기 투자 금액은 <b>{ROUNDTWO(P)}</b>만원이에요!
            </span>
          )}
          {Method === "Mutual" && (
            <span style={{ marginTop: "0.8rem" }}>
              매년 <b>{ROUNDTWO(PMT)}</b>만원을 넣어야해요!
            </span>
          )}
        </div>
      </div>

      <ComposedChart
        width={400}
        height={250}
        margin={{ top: 20, bottom: 20 }}
        data={data}
      >
        <XAxis dataKey="year" tick={{ fontSize: 10 }} padding={{ right: 20 }} />
        <YAxis
          tick={{ fontSize: 10 }}
          padding={{ bottom: 10 }}
          domain={["auto", "auto"]}
          tickFormatter={formatYAxis}
        />
        <Tooltip formatter={formatTooltip} />
        <Legend tick={{ fontSize: 10 }} />
        <CartesianGrid stroke="#f4f4f4" />
        <Area
          type="monotone"
          dataKey="예상수익범위"
          fill="#FFB950"
          stroke="#FFB950"
        />
        <Line
          type="monotone"
          dataKey="예상수익"
          stroke="#1D1A82"
        />
        <Line
          type="monotone"
          dataKey="현재가치"
          stroke="#B45CCA"
        />
      </ComposedChart>
    </div>
  );
}

export default GBIGraph;
