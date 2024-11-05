import React, { useState, useRef, useEffect } from "react";

const NQueens = () => {
    const [boardSize, setBoardSize] = useState(4);
    const [board, setBoard] = useState(
        Array(4)
            .fill(null)
            .map(() => Array(4).fill(" "))
    );
    const [resultCount, setResultCount] = useState(0);
    const [buttonText, setButtonText] = useState("시뮬레이션 시작/재개");
    const [selectedSpeed, setSelectedSpeed] = useState("보통"); // 기본 속도 설정

    // 렌더링 간에 변경 가능하지만 렌더링을 유발하지 않는 변수를 useRef로 관리
    const resultStack = useRef([]);
    const pauseRef = useRef(null);
    const isRunningRef = useRef(false); // 시뮬레이션 실행 상태를 추적

    // 속도 변수 (밀리초 단위)
    const speed = useRef(500); // 기본 속도 500ms (보통)

    // 속도 옵션 정의
    const speedOptions = [
        { label: "느림", value: 1000 },
        { label: "보통", value: 500 },
        { label: "빠름", value: 100 },
    ];

    // 특정 위치(y, x)에 퀸을 놓아도 안전한지 확인하는 함수
    const isSafe = (y, x) => {
        for (let [row, col] of resultStack.current) {
            if (
                row === y ||
                col === x ||
                Math.abs(row - y) === Math.abs(col - x)
            ) {
                return false;
            }
        }
        return true;
    };

    // 보드 상태를 업데이트하는 함수
    const updateBoard = (y, x, value) => {
        setBoard((prevBoard) => {
            const newBoard = prevBoard.map((row, rowIndex) =>
                row.map((col, colIndex) =>
                    rowIndex === y && colIndex === x ? value : col
                )
            );
            return newBoard;
        });
    };

    // 백트래킹 알고리즘 (재귀적 접근)
    const backTracking = async (depth) => {
        if (!isRunningRef.current) {
            return;
        }

        if (depth === boardSize) {
            setResultCount((prev) => prev + 1);
            isRunningRef.current = false;
            setButtonText("시뮬레이션 시작/재개");
            // 시뮬레이션을 일시 정지하고 재개를 기다림
            await new Promise((resolve) => {
                pauseRef.current = resolve;
            });
            return;
        }

        for (let i = 0; i < boardSize; i++) {
            if (!isRunningRef.current) {
                return;
            }

            if (isSafe(depth, i)) {
                // 퀸을 놓음
                resultStack.current.push([depth, i]);
                updateBoard(depth, i, "Q");

                // 시각적 효과를 위해 설정된 속도만큼 대기
                await new Promise((resolve) => setTimeout(resolve, speed.current));

                // 다음 퀸을 놓기 위해 재귀 호출
                await backTracking(depth + 1);

                if (!isRunningRef.current) {
                    return;
                }

                // 퀸을 제거하고 백트래킹
                resultStack.current.pop();
                updateBoard(depth, i, " ");
            }
        }
    };

    // 시뮬레이션 시작 또는 재개 함수
    const startSimulation = async () => {
        if (isRunningRef.current) {
            // 이미 실행 중인 경우 아무 작업도 하지 않음
            return;
        }

        isRunningRef.current = true;
        setButtonText("시뮬레이션 중...");

        if (pauseRef.current) {
            // 일시 정지 상태인 경우, 재개를 위해 resolve 호출
            pauseRef.current();
            pauseRef.current = null;
        } else {
            // 시뮬레이션 시작
            await backTracking(0);
            alert("시뮬레이션 종료");
            setButtonText("시뮬레이션 시작/재개");
        }
    };

    // 보드 크기 변경 처리 함수
    const handleBoardSizeChange = (e) => {
        const newSize = parseInt(e.target.value, 10);
        if (isNaN(newSize) || newSize < 1 || newSize > 20) {
            alert("보드 크기는 1 이상 20 이하의 숫자여야 합니다.");
            return;
        }
        setBoardSize(newSize);
    };

    // 속도 선택 처리 함수
    const handleSpeedChange = (e) => {
        const selected = e.target.value;
        setSelectedSpeed(selected);
        const speedOption = speedOptions.find(option => option.label === selected);
        if (speedOption) {
            speed.current = speedOption.value;
        }
    };

    // 보드 크기가 변경될 때 보드를 초기화하는 useEffect
    useEffect(() => {
        setBoard(
            Array(boardSize)
                .fill(null)
                .map(() => Array(boardSize).fill(" "))
        );
        setResultCount(0);
        resultStack.current = [];
        isRunningRef.current = false;
        setButtonText("시뮬레이션 시작/재개");
        pauseRef.current = null;
    }, [boardSize]);

    // 체스보드를 렌더링하는 함수
    const renderBoard = () => {
        return board.map((row, rowIndex) => (
            <div key={rowIndex} style={{ display: "flex" }}>
                {row.map((col, colIndex) => (
                    <div
                        key={colIndex}
                        style={{
                            width: "50px",
                            height: "50px",
                            border: "1px solid black",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            backgroundColor:
                                (rowIndex + colIndex) % 2 === 0
                                    ? "#f0d9b5" // 흰색 셀 색상
                                    : "#b58863", // 검은색 셀 색상
                            fontSize: "24px",
                        }}
                    >
                        {col}
                    </div>
                ))}
            </div>
        ));
    };

    return (
        <div style={styles.container}>
            <h1 style={styles.title}>N-Queens 문제</h1>
            <div style={styles.inputContainer}>
                <label htmlFor="boardSize" style={styles.label}>
                    체스판 크기:
                </label>
                <input
                    type="number"
                    id="boardSize"
                    value={boardSize}
                    onChange={handleBoardSizeChange}
                    min="1"
                    max="20"
                    style={styles.input}
                />
            </div>
            <div style={styles.inputContainer}>
                <label htmlFor="speed" style={styles.label}>
                    속도:
                </label>
                <select
                    id="speed"
                    value={selectedSpeed}
                    onChange={handleSpeedChange}
                    style={styles.select}
                >
                    {speedOptions.map(option => (
                        <option key={option.label} value={option.label}>
                            {option.label} ({option.value / 1000}초)
                        </option>
                    ))}
                </select>
            </div>
            <div style={styles.boardContainer}>{renderBoard()}</div>
            <div style={styles.buttonContainer}>
                <button onClick={startSimulation} style={styles.button}>
                    {buttonText}
                </button>
            </div>
            <div style={styles.result}>
                {resultCount}개 해법 발견
            </div>
        </div>
    );
};

// 스타일 객체
const styles = {
    container: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        fontFamily: "Arial, sans-serif",
        padding: "20px",
        backgroundColor: "#f5f5f5",
        minHeight: "100vh",
    },
    title: {
        marginBottom: "20px",
        color: "#333",
    },
    inputContainer: {
        marginBottom: "20px",
        display: "flex",
        alignItems: "center",
    },
    label: {
        marginRight: "10px",
        fontSize: "18px",
        color: "#333",
    },
    input: {
        width: "60px",
        padding: "5px",
        fontSize: "16px",
        borderRadius: "4px",
        border: "1px solid #ccc",
        textAlign: "center",
    },
    select: {
        width: "150px",
        padding: "5px",
        fontSize: "16px",
        borderRadius: "4px",
        border: "1px solid #ccc",
    },
    boardContainer: {
        marginBottom: "20px",
    },
    buttonContainer: {
        display: "flex",
        gap: "10px",
        marginBottom: "20px",
    },
    button: {
        padding: "10px 20px",
        fontSize: "16px",
        borderRadius: "4px",
        border: "none",
        cursor: "pointer",
        backgroundColor: "#4CAF50",
        color: "white",
        transition: "background-color 0.3s",
    },
    result: {
        fontSize: "18px",
        color: "#333",
    },
};

export default NQueens;
