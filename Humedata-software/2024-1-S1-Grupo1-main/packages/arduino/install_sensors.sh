# bin/bash
# Description: Install sensor for use with Arduino

install_sensor() {
    sensor=$1
    case $sensor in
        pH)
	    ln -sf pH/pH_I2C.ino ./pH.ino
            ;;
        EC)
	    ln -sf EC/EC_I2C.ino ./EC.ino
            ;;
        DO)
	    ln -sf DO/DO_I2C.ino ./DO.ino
            ;;
        ORP)
	    ln -sf ORP/ORP_I2C.ino ./ORP.ino
            ;;
        *)
            echo "Invalid sensor specified: $sensor. Valid options are: pH, EC, DO, ORP"
            ;;
    esac
}

if [ $# -eq 0 ]; then
    echo "No sensor specified. Usage: $0 {pH|EC|DO|ORP|all}"
    exit 1
fi

install_sensor $1
