import { useEffect } from "react";

interface DemoModeProps {
    mode: string;
    onDemoMode: Function;
}

function DemoMode({mode, onDemoMode}:DemoModeProps) {
    useEffect(() => {
        if (mode) {
            onDemoMode(mode)
        }
    }, [mode])

    return (<></>)
}

export default DemoMode