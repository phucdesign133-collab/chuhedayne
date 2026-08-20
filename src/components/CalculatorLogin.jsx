import React, { useState } from "react";

export default function CalculatorLogin({ onLoginSuccess }) {
  const [display, setDisplay] = useState("0");
  const [equation, setEquation] = useState("");
  const [expressionTokens, setExpressionTokens] = useState(["0"]);
  const [resetDisplay, setResetDisplay] = useState(false);
  const [inputSequence, setInputSequence] = useState("");

  const SECRET_PASSWORD = "133999";

  const formatNumber = (numStr) => {
    if (!numStr && numStr !== "0") return "";
    const parts = String(numStr).split(".");
    let integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return parts.length > 1 ? `${integerPart}.${parts[1]}` : integerPart;
  };

  // Ghép các token thành chuỗi hiển thị có định dạng hàng nghìn
  const getFormattedExpression = () => {
    return expressionTokens
      .map((token) => {
        if (!isNaN(token) && token !== "") {
          return formatNumber(token);
        }
        return token;
      })
      .join(" ");
  };

  const handleNumber = (num) => {
    setInputSequence((prev) => prev + num);
    
    // Nếu vừa bấm '=' xong mà nhập số mới -> Reset bắt đầu phép tính mới
    if (resetDisplay) {
      setExpressionTokens([num]);
      setDisplay(num);
      setResetDisplay(false);
      setEquation("");
      return;
    }

    setExpressionTokens((prev) => {
      const lastToken = prev[prev.length - 1];
      // Nếu token cuối cùng là toán tử hoặc rỗng, thêm token số mới
      if (["+", "-", "×", "÷"].includes(lastToken) || prev.length === 0) {
        return [...prev, num];
      } else {
        // Ngược lại, đang nhập dở số đó thì nối tiếp chuỗi số hiện tại
        const updatedLast = lastToken === "0" && num !== "." ? num : lastToken + num;
        return [...prev.slice(0, prev.length - 1), updatedLast];
      }
    });
    setDisplay(num);
  };

  const handleClear = () => {
    setDisplay("0");
    setExpressionTokens(["0"]);
    setEquation("");
    setResetDisplay(false);
    setInputSequence("");
  };

  const handleOperator = (op) => {
    setResetDisplay(false);
    setEquation("");
    
    setExpressionTokens((prev) => {
      const lastToken = prev[prev.length - 1];
      // Nếu token cuối cũng là toán tử, thay thế bằng toán tử mới
      if (["+", "-", "×", "÷"].includes(lastToken)) {
        return [...prev.slice(0, prev.length - 1), op];
      }
      return [...prev, op];
    });
  };

  // Hàm tính toán biểu thức chuẩn theo thứ tự toán học đơn giản từ trái qua hoặc gộp
  const evaluateExpression = (tokens) => {
    // Chuyển đổi trung tố sang dạng tính toán an toàn
    try {
      // Lọc bỏ token rỗng
      const cleanTokens = tokens.filter(t => t !== "");
      if (cleanTokens.length === 0) return 0;

      // Xử lý nhân chia trước, cộng trừ sau
      let nums = [];
      let ops = [];

      for (let i = 0; i < cleanTokens.length; i++) {
        let t = cleanTokens[i];
        if (!isNaN(t)) {
          nums.push(parseFloat(t));
        } else if (["+", "-", "×", "÷"].includes(t)) {
          while (
            ops.length > 0 &&
            (("×" === ops[ops.length - 1] || "÷" === ops[ops.length - 1]) &&
             (t === "+" || t === "-"))
          ) {
            let b = nums.pop();
            let a = nums.pop();
            let op = ops.pop();
            nums.push(applyOp(a, b, op));
          }
          ops.push(t);
        }
      }

      while (ops.length > 0) {
        let b = nums.pop();
        let a = nums.pop();
        let op = ops.pop();
        nums.push(applyOp(a, b, op));
      }

      return nums[0];
    } catch (e) {
      return "Error";
    }
  };

  const applyOp = (a, b, op) => {
    switch (op) {
      case "+": return a + b;
      case "-": return a - b;
      case "×": return a * b;
      case "÷": return b !== 0 ? a / b : "Error";
      default: return b;
    }
  };

  const handleEquals = () => {
    const fullExprStr = expressionTokens.join("");
    if (inputSequence.includes(SECRET_PASSWORD) || fullExprStr === SECRET_PASSWORD) {
      onLoginSuccess();
      return;
    }

    const result = evaluateExpression(expressionTokens);
    
    setEquation(`${getFormattedExpression()} =`);
    setDisplay(String(result));
    setExpressionTokens([String(result)]);
    setResetDisplay(true);
    setInputSequence("");
  };

  const handlePercent = () => {
    const currentVal = parseFloat(display) / 100;
    setDisplay(String(currentVal));
    setExpressionTokens((prev) => [...prev.slice(0, prev.length - 1), String(currentVal)]);
  };

  const handleToggleSign = () => {
    const currentVal = parseFloat(display) * -1;
    setDisplay(String(currentVal));
    setExpressionTokens((prev) => [...prev.slice(0, prev.length - 1), String(currentVal)]);
  };

  const currentText = getFormattedExpression();
  const dynamicFontSize = currentText.length > 15 ? "36px" : currentText.length > 10 ? "46px" : "60px";

  return (
    <div style={{
      backgroundColor: "#000000", 
      width: "100vw", 
      height: "100vh",
      display: "flex", 
      flexDirection: "column", 
      justifyContent: "flex-end",
      padding: "10px 12px 16px 12px", 
      boxSizing: "border-box",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif",
      color: "#ffffff", 
      position: "fixed", 
      top: 0, 
      left: 0, 
      zIndex: 99999
    }}>
      {/* Hàng trên: Phép tính nhỏ */}
      <div style={{
        textAlign: "right", 
        fontSize: "18px", 
        color: "#888",
        paddingRight: "8px", 
        minHeight: "24px",
        wordBreak: "break-all"
      }}>
        {equation}
      </div>
      
      {/* Hàng dưới: Giữ nguyên toàn bộ chuỗi phép tính cho tới khi bấm dấu = */}
      <div style={{
        textAlign: "right", 
        fontSize: dynamicFontSize, 
        fontWeight: "300",
        marginBottom: "12px", 
        paddingRight: "8px", 
        lineHeight: "1.1",
        wordBreak: "break-all",
        overflowWrap: "break-word",
        maxHeight: "140px",
        overflowY: "hidden"
      }}>
        {currentText}
      </div>

      {/* Bàn phím chuẩn iOS */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px" }}>
        <button onClick={handleClear} style={btnStyle("#a6a6a6", "#000")}>AC</button>
        <button onClick={handleToggleSign} style={btnStyle("#a6a6a6", "#000")}>+/-</button>
        <button onClick={handlePercent} style={btnStyle("#a6a6a6", "#000")}>%</button>
        <button onClick={() => handleOperator("÷")} style={btnStyle("#ff9f0a", "#fff")}>÷</button>
        
        <button onClick={() => handleNumber("7")} style={btnStyle("#333333", "#fff")}>7</button>
        <button onClick={() => handleNumber("8")} style={btnStyle("#333333", "#fff")}>8</button>
        <button onClick={() => handleNumber("9")} style={btnStyle("#333333", "#fff")}>9</button>
        <button onClick={() => handleOperator("×")} style={btnStyle("#ff9f0a", "#fff")}>×</button>
        
        <button onClick={() => handleNumber("4")} style={btnStyle("#333333", "#fff")}>4</button>
        <button onClick={() => handleNumber("5")} style={btnStyle("#333333", "#fff")}>5</button>
        <button onClick={() => handleNumber("6")} style={btnStyle("#333333", "#fff")}>6</button>
        <button onClick={() => handleOperator("-")} style={btnStyle("#ff9f0a", "#fff")}>-</button>
        
        <button onClick={() => handleNumber("1")} style={btnStyle("#333333", "#fff")}>1</button>
        <button onClick={() => handleNumber("2")} style={btnStyle("#333333", "#fff")}>2</button>
        <button onClick={() => handleNumber("3")} style={btnStyle("#333333", "#fff")}>3</button>
        <button onClick={() => handleOperator("+")} style={btnStyle("#ff9f0a", "#fff")}>+</button>
        
        <button onClick={handleToggleSign} style={btnStyle("#333333", "#fff")}>+/-</button>
        <button onClick={() => handleNumber("0")} style={btnStyle("#333333", "#fff")}>0</button>
        <button onClick={() => handleNumber(",")} style={btnStyle("#333333", "#fff")}>,</button>
        <button onClick={handleEquals} style={btnStyle("#ff9f0a", "#fff")}>=</button>
      </div>
    </div>
  );
}

function btnStyle(bg, color) {
  return {
    backgroundColor: bg, 
    color: color, 
    border: "none", 
    borderRadius: "50%", 
    aspectRatio: "1 / 1", 
    width: "100%",
    fontSize: "40px", 
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    outline: "none",
    userSelect: "none"
  };
}