# sh doesnt seem to have the -e tag 
# example:
# echo "[\033[1;34mINFO\033[0m] $1"

# bash requires a -e tag, or else it just prints the string w/o interpreting the colour codes
# example:
# echo -e "[\033[1;34mINFO\033[0m] $1"

info() {
    echo "[\033[1;34mINFO\033[0m] $1"
    # echo -e "[\033[1;34mINFO\033[0m] $1"
}

warn() {
    echo "[\033[1;33mWARN\033[0m] $1"
    # echo -e "[\033[1;33mWARN\033[0m] $1"
}

error() {
    echo "[\033[1;31mERROR\033[0m] $1"
    # echo -e "[\033[1;31mERROR\033[0m] $1"
}

fatal() {
    echo "[\033[1;31mFATAL\033[0m] $1"
    # echo -e "[\033[1;31mFATAL\033[0m] $1"
    read -p "Press Enter to continue..." var
    exit 1
}

success() {
    echo "[\033[1;32mSUCCESS\033[0m] $1"
    # echo -e "[\033[1;32mSUCCESS\033[0m] $1"
}

info "test"
warn "test"
error "test"
success "test"
fatal "test"