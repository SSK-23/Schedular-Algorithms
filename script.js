document.getElementById("simulate-btn").addEventListener("click", () => {
    const n = parseInt(document.getElementById("numProcesses").value);
    const arrivalTime = document.getElementById("arrivalTime").value.split(",").map(Number);
    const runTime = document.getElementById("runTime").value.split(",").map(Number);
    const quantum = parseInt(document.getElementById("quantum").value);
    const algorithm = document.getElementById("algorithm").value;

    if (n <= 0 || arrivalTime.length !== n || runTime.length !== n) {
        alert("Invalid input! Ensure all fields are correctly filled.");
        return;
    }

    let results;

    switch (algorithm) {
        case "FCFS":
            results = fcfs(n, arrivalTime, runTime);
            break;
        case "SJF-non-preemptive":
            results = sjfNonPreemptive(n, arrivalTime, runTime);
            break;
        case "SJF-preemptive":
            results = sjfPreemptive(n, arrivalTime, runTime);
            break;
        case "Priority-non-preemptive":
            results = priorityNonPreemptive(n, arrivalTime, runTime);
            break;
        case "Priority-preemptive":
            results = priorityPreemptive(n, arrivalTime, runTime);
            break;
        case "RR":
            results = roundRobin(n, arrivalTime, runTime, quantum);
            break;
        default:
            alert("Invalid algorithm selected!");
            return;
    }

    displayResults(results);
});

function displayResults({ executionOrder, waitingTimes, turnaroundTimes, avgWaiting, avgTurnaround }) {
    document.getElementById("execution-order").textContent = `Order of Execution: ${executionOrder.join(", ")}`;
    document.getElementById("waiting-time").textContent = `Waiting Times: ${waitingTimes.join(", ")}`;
    document.getElementById("turnaround-time").textContent = `Turnaround Times: ${turnaroundTimes.join(", ")}`;
    document.getElementById("averages").textContent = `Average Waiting Time: ${avgWaiting.toFixed(2)}, Average Turnaround Time: ${avgTurnaround.toFixed(2)}`;
}

// Helper functions
function calculateTimes(n, arrivalTime, runTime, completionTimes) {
    const turnaroundTimes = [];
    const waitingTimes = [];
    for (let i = 0; i < n; i++) {
        turnaroundTimes[i] = completionTimes[i] - arrivalTime[i];
        waitingTimes[i] = turnaroundTimes[i] - runTime[i];
    }
    return { turnaroundTimes, waitingTimes };
}

// 1. First Come First Serve (FCFS)
function fcfs(n, arrivalTime, runTime) {
    const completionTimes = [];
    const executionOrder = [];
    let currentTime = 0;

    for (let i = 0; i < n; i++) {
        const process = i + 1;
        if (currentTime < arrivalTime[i]) currentTime = arrivalTime[i];
        currentTime += runTime[i];
        completionTimes[i] = currentTime;
        executionOrder.push(process);
    }

    const { turnaroundTimes, waitingTimes } = calculateTimes(n, arrivalTime, runTime, completionTimes);
    const avgWaiting = waitingTimes.reduce((a, b) => a + b) / n;
    const avgTurnaround = turnaroundTimes.reduce((a, b) => a + b) / n;

    return { executionOrder, waitingTimes, turnaroundTimes, avgWaiting, avgTurnaround };
}

// 2. Shortest Job First (Non-Preemptive)
function sjfNonPreemptive(n, arrivalTime, runTime) {
    const completionTimes = [];
    const executionOrder = [];
    const visited = Array(n).fill(false);
    let currentTime = 0;

    for (let count = 0; count < n; count++) {
        let minIndex = -1;
        for (let i = 0; i < n; i++) {
            if (!visited[i] && arrivalTime[i] <= currentTime) {
                if (minIndex === -1 || runTime[i] < runTime[minIndex]) {
                    minIndex = i;
                }
            }
        }

        if (minIndex === -1) {
            currentTime++;
            count--;
        } else {
            visited[minIndex] = true;
            currentTime += runTime[minIndex];
            completionTimes[minIndex] = currentTime;
            executionOrder.push(minIndex + 1);
        }
    }

    const { turnaroundTimes, waitingTimes } = calculateTimes(n, arrivalTime, runTime, completionTimes);
    const avgWaiting = waitingTimes.reduce((a, b) => a + b) / n;
    const avgTurnaround = turnaroundTimes.reduce((a, b) => a + b) / n;

    return { executionOrder, waitingTimes, turnaroundTimes, avgWaiting, avgTurnaround };
}

// 3. Shortest Job First (Preemptive)
function sjfPreemptive(n, arrivalTime, runTime) {
    const remainingTime = [...runTime];
    const completionTimes = Array(n).fill(0);
    const executionOrder = [];
    let currentTime = 0;
    let completed = 0;

    while (completed < n) {
        let minIndex = -1;
        for (let i = 0; i < n; i++) {
            if (arrivalTime[i] <= currentTime && remainingTime[i] > 0) {
                if (minIndex === -1 || remainingTime[i] < remainingTime[minIndex]) {
                    minIndex = i;
                }
            }
        }

        if (minIndex === -1) {
            currentTime++;
        } else {
            executionOrder.push(minIndex + 1);
            remainingTime[minIndex]--;
            currentTime++;

            if (remainingTime[minIndex] === 0) {
                completionTimes[minIndex] = currentTime;
                completed++;
            }
        }
    }

    const { turnaroundTimes, waitingTimes } = calculateTimes(n, arrivalTime, runTime, completionTimes);
    const avgWaiting = waitingTimes.reduce((a, b) => a + b) / n;
    const avgTurnaround = turnaroundTimes.reduce((a, b) => a + b) / n;

    return { executionOrder, waitingTimes, turnaroundTimes, avgWaiting, avgTurnaround };
}

// 4. Priority Non-Preemptive
function priorityNonPreemptive(n, arrivalTime, runTime) {
    const priorities = prompt("Enter priorities for each process (comma-separated):")
        .split(",")
        .map(Number);
    const processes = Array.from({ length: n }, (_, i) => i);

    processes.sort((a, b) => {
        if (priorities[a] === priorities[b]) return arrivalTime[a] - arrivalTime[b];
        return priorities[a] - priorities[b];
    });

    const sortedArrivalTime = processes.map((i) => arrivalTime[i]);
    const sortedRunTime = processes.map((i) => runTime[i]);

    const results = fcfs(n, sortedArrivalTime, sortedRunTime);

    return {
        ...results,
        executionOrder: processes.map((p) => p + 1),
    };
}

// 5. Priority Preemptive
function priorityPreemptive(n, arrivalTime, runTime) {
    const priorities = prompt("Enter priorities for each process (comma-separated):")
        .split(",")
        .map(Number);
    const remainingTime = [...runTime];
    const completionTimes = Array(n).fill(0);
    const executionOrder = [];
    let currentTime = 0;
    let completed = 0;

    while (completed < n) {
        let minIndex = -1;

        for (let i = 0; i < n; i++) {
            if (
                arrivalTime[i] <= currentTime &&
                remainingTime[i] > 0 &&
                (minIndex === -1 || priorities[i] < priorities[minIndex])
            ) {
                minIndex = i;
            }
        }

        if (minIndex === -1) {
            currentTime++;
        } else {
            executionOrder.push(minIndex + 1);
            remainingTime[minIndex]--;
            currentTime++;

            if (remainingTime[minIndex] === 0) {
                completionTimes[minIndex] = currentTime;
                completed++;
            }
        }
    }

    const { turnaroundTimes, waitingTimes } = calculateTimes(n, arrivalTime, runTime, completionTimes);
    const avgWaiting = waitingTimes.reduce((a, b) => a + b) / n;
    const avgTurnaround = turnaroundTimes.reduce((a, b) => a + b) / n;

    return { executionOrder, waitingTimes, turnaroundTimes, avgWaiting, avgTurnaround };
}

function roundRobin(n, arrivalTime, runTime, quantum) {
    const remainingTime = [...runTime];
    const completionTimes = Array(n).fill(0);
    const executionOrder = [];
    let currentTime = 0;
    let completed = 0;
    const queue = [];
    const visited = Array(n).fill(false);

    while (completed < n) {
        // Add processes that have arrived to the queue
        for (let i = 0; i < n; i++) {
            if (arrivalTime[i] <= currentTime && remainingTime[i] > 0 && !visited[i]) {
                queue.push(i);
                visited[i] = true;
            }
        }

        if (queue.length === 0) {
            currentTime++;
            continue;
        }

        const currentProcess = queue.shift();

        // Execute the process for the quantum time or until completion
        const timeSlice = Math.min(remainingTime[currentProcess], quantum);
        currentTime += timeSlice;
        remainingTime[currentProcess] -= timeSlice;
        executionOrder.push(currentProcess + 1);

        // Add newly arrived processes to the queue
        for (let i = 0; i < n; i++) {
            if (arrivalTime[i] <= currentTime && remainingTime[i] > 0 && !visited[i]) {
                queue.push(i);
                visited[i] = true;
            }
        }

        // If the process is not yet completed, requeue it
        if (remainingTime[currentProcess] > 0) {
            queue.push(currentProcess);
        } else {
            // Mark the process as completed
            completionTimes[currentProcess] = currentTime;
            completed++;
        }
    }

    const { turnaroundTimes, waitingTimes } = calculateTimes(n, arrivalTime, runTime, completionTimes);
    const avgWaiting = waitingTimes.reduce((a, b) => a + b) / n;
    const avgTurnaround = turnaroundTimes.reduce((a, b) => a + b) / n;

    return { executionOrder, waitingTimes, turnaroundTimes, avgWaiting, avgTurnaround };
}
