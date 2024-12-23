# bin/bash
# Description: Install sensor for use with Arduino

install_sensor() {
    sensor=$1
    case $sensor in
        pH)
	    ln -sf pH/pH_Emulator.ino ./pH.ino
            ;;
        EC)
	    ln -sf EC/EC_Emulator.ino ./EC.ino
            ;;
        DO)
	    ln -sf DO/DO_Emulator.ino ./DO.ino
            ;;
        ORP)
	    ln -sf ORP/ORP_Emulator.ino ./ORP.ino
            ;;
        all)
	    ln -sf pH/pH_Emulator.ino ./pH.ino
	    ln -sf EC/EC_Emulator.ino ./EC.ino
	    ln -sf DO/DO_Emulator.ino ./DO.ino
	    ln -sf ORP/ORP_Emulator.ino ./ORP.ino
            ;;
        *)
            echo "Invalid sensor specified. Valid options are: pH, EC, DO, ORP, all"
            ;;
    esac
}

if [ $# -eq 0 ]; then
    echo "No sensor specified. Usage: $0 {pH|EC|DO|ORP|all}"
    exit 1
fi

install_sensor $1
