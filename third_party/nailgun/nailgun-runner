#!/usr/bin/env python
#
# Copyright 2004-2015, Martian Software, Inc.
# Copyright 2017-Present Facebook, Inc.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
# http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

from __future__ import print_function
import ctypes
import platform
import optparse
import os
import os.path
import select
import socket
import struct
import sys
from threading import Condition, Event, Thread, RLock

is_py2 = sys.version[0] == "2"
if is_py2:
    import Queue as Queue
    import __builtin__ as builtin

    def to_bytes(s):
        return s


else:
    import queue as Queue
    import builtins as builtin
    from io import UnsupportedOperation

    def to_bytes(s):
        return bytes(s, "utf-8")


def bytes_to_str(bytes_to_convert):
    """Version independent way of converting bytes to string."""
    return bytes_to_convert if is_py2 else bytes_to_convert.decode("utf-8")


# @author <a href="http://www.martiansoftware.com/contact.html">Marty Lamb</a>
# @author Pete Kirkham (Win32 port)
# @author Sergey Balabanov, Ben Hamilton (Python port)
#
# Please try to keep this working on Python 2.6.

NAILGUN_VERSION = "1.0.0"
BUFSIZE = 2048
NAILGUN_PORT_DEFAULT = 2113
CHUNK_HEADER_LEN = 5
THREAD_TERMINATION_TIMEOUT_SEC = 0.5
STDIN_BUFFER_LINE_SIZE = 10

CHUNKTYPE_STDIN = b"0"
CHUNKTYPE_STDOUT = b"1"
CHUNKTYPE_STDERR = b"2"
CHUNKTYPE_STDIN_EOF = b"."
CHUNKTYPE_ARG = b"A"
CHUNKTYPE_LONGARG = b"L"
CHUNKTYPE_ENV = b"E"
CHUNKTYPE_DIR = b"D"
CHUNKTYPE_CMD = b"C"
CHUNKTYPE_EXIT = b"X"
CHUNKTYPE_SENDINPUT = b"S"
CHUNKTYPE_HEARTBEAT = b"H"

NSEC_PER_SEC = 1000000000
DEFAULT_HEARTBEAT_INTERVAL_SEC = 0.5
SELECT_MAX_BLOCK_TIME_SEC = 1.0
SEND_THREAD_WAIT_TERMINATION_SEC = 5.0

# We need to support Python 2.6 hosts which lack memoryview().
HAS_MEMORYVIEW = "memoryview" in dir(builtin)

EVENT_STDIN_CHUNK = 0
EVENT_STDIN_CLOSED = 1
EVENT_STDIN_EXCEPTION = 2


class NailgunException(Exception):
    SOCKET_FAILED = 231
    CONNECT_FAILED = 230
    UNEXPECTED_CHUNKTYPE = 229
    CONNECTION_BROKEN = 227

    def __init__(self, message, code):
        self.message = message
        self.code = code

    def __str__(self):
        return self.message


class Transport(object):
    def close(self):
        raise NotImplementedError()

    def sendall(self, data):
        raise NotImplementedError()

    def recv(self, size):
        raise NotImplementedError()

    def recv_into(self, buffer, size=None):
        raise NotImplementedError()

    def select(self, timeout_secs):
        raise NotImplementedError()


class UnixTransport(Transport):
    def __init__(self, __socket):
        self.__socket = __socket
        self.recv_flags = 0
        self.send_flags = 0
        if hasattr(socket, "MSG_WAITALL"):
            self.recv_flags |= socket.MSG_WAITALL
        if hasattr(socket, "MSG_NOSIGNAL"):
            self.send_flags |= socket.MSG_NOSIGNAL

    def close(self):
        return self.__socket.close()

    def sendall(self, data):
        result = self.__socket.sendall(data, self.send_flags)
        return result

    def recv(self, nbytes):
        return self.__socket.recv(nbytes, self.recv_flags)

    def recv_into(self, buffer, nbytes=None):
        return self.__socket.recv_into(buffer, nbytes, self.recv_flags)

    def select(self, timeout_secs):
        select_list = [self.__socket]
        readable, _, exceptional = select.select(
            select_list, [], select_list, timeout_secs
        )
        return (self.__socket in readable), (self.__socket in exceptional)


if os.name == "nt":
    import ctypes.wintypes

    wintypes = ctypes.wintypes
    GENERIC_READ = 0x80000000
    GENERIC_WRITE = 0x40000000
    FILE_FLAG_OVERLAPPED = 0x40000000
    OPEN_EXISTING = 3
    INVALID_HANDLE_VALUE = ctypes.c_void_p(-1).value
    FORMAT_MESSAGE_FROM_SYSTEM = 0x00001000
    FORMAT_MESSAGE_ALLOCATE_BUFFER = 0x00000100
    FORMAT_MESSAGE_IGNORE_INSERTS = 0x00000200
    WAIT_FAILED = 0xFFFFFFFF
    WAIT_TIMEOUT = 0x00000102
    WAIT_OBJECT_0 = 0x00000000
    WAIT_IO_COMPLETION = 0x000000C0
    INFINITE = 0xFFFFFFFF

    # Overlapped I/O operation is in progress. (997)
    ERROR_IO_PENDING = 0x000003E5
    ERROR_PIPE_BUSY = 231

    # The pointer size follows the architecture
    # We use WPARAM since this type is already conditionally defined
    ULONG_PTR = ctypes.wintypes.WPARAM

    class OVERLAPPED(ctypes.Structure):
        _fields_ = [
            ("Internal", ULONG_PTR),
            ("InternalHigh", ULONG_PTR),
            ("Offset", wintypes.DWORD),
            ("OffsetHigh", wintypes.DWORD),
            ("hEvent", wintypes.HANDLE),
        ]

    LPDWORD = ctypes.POINTER(wintypes.DWORD)

    CreateFile = ctypes.windll.kernel32.CreateFileW
    CreateFile.argtypes = [
        wintypes.LPCWSTR,
        wintypes.DWORD,
        wintypes.DWORD,
        wintypes.LPVOID,
        wintypes.DWORD,
        wintypes.DWORD,
        wintypes.HANDLE,
    ]
    CreateFile.restype = wintypes.HANDLE

    CloseHandle = ctypes.windll.kernel32.CloseHandle
    CloseHandle.argtypes = [wintypes.HANDLE]
    CloseHandle.restype = wintypes.BOOL

    ReadFile = ctypes.windll.kernel32.ReadFile
    ReadFile.argtypes = [
        wintypes.HANDLE,
        wintypes.LPVOID,
        wintypes.DWORD,
        LPDWORD,
        ctypes.POINTER(OVERLAPPED),
    ]
    ReadFile.restype = wintypes.BOOL

    WriteFile = ctypes.windll.kernel32.WriteFile
    WriteFile.argtypes = [
        wintypes.HANDLE,
        wintypes.LPVOID,
        wintypes.DWORD,
        LPDWORD,
        ctypes.POINTER(OVERLAPPED),
    ]
    WriteFile.restype = wintypes.BOOL

    GetLastError = ctypes.windll.kernel32.GetLastError
    GetLastError.argtypes = []
    GetLastError.restype = wintypes.DWORD

    SetLastError = ctypes.windll.kernel32.SetLastError
    SetLastError.argtypes = [wintypes.DWORD]
    SetLastError.restype = None

    FormatMessage = ctypes.windll.kernel32.FormatMessageW
    FormatMessage.argtypes = [
        wintypes.DWORD,
        wintypes.LPVOID,
        wintypes.DWORD,
        wintypes.DWORD,
        ctypes.POINTER(wintypes.LPCWSTR),
        wintypes.DWORD,
        wintypes.LPVOID,
    ]
    FormatMessage.restype = wintypes.DWORD

    LocalFree = ctypes.windll.kernel32.LocalFree

    GetOverlappedResult = ctypes.windll.kernel32.GetOverlappedResult
    GetOverlappedResult.argtypes = [
        wintypes.HANDLE,
        ctypes.POINTER(OVERLAPPED),
        LPDWORD,
        wintypes.BOOL,
    ]
    GetOverlappedResult.restype = wintypes.BOOL

    CreateEvent = ctypes.windll.kernel32.CreateEventW
    CreateEvent.argtypes = [LPDWORD, wintypes.BOOL, wintypes.BOOL, wintypes.LPCWSTR]
    CreateEvent.restype = wintypes.HANDLE

    PeekNamedPipe = ctypes.windll.kernel32.PeekNamedPipe
    PeekNamedPipe.argtypes = [
        wintypes.HANDLE,
        wintypes.LPVOID,
        wintypes.DWORD,
        LPDWORD,
        LPDWORD,
        LPDWORD,
    ]
    PeekNamedPipe.restype = wintypes.BOOL

    WaitNamedPipe = ctypes.windll.kernel32.WaitNamedPipeW
    WaitNamedPipe.argtypes = [wintypes.LPCWSTR, wintypes.DWORD]
    WaitNamedPipe.restype = wintypes.BOOL

    def _win32_strerror(err):
        """ expand a win32 error code into a human readable message """
        # FormatMessage will allocate memory and assign it here
        buf = ctypes.c_wchar_p()
        FormatMessage(
            FORMAT_MESSAGE_FROM_SYSTEM
            | FORMAT_MESSAGE_ALLOCATE_BUFFER
            | FORMAT_MESSAGE_IGNORE_INSERTS,
            None,
            err,
            0,
            buf,
            0,
            None,
        )
        try:
            return buf.value
        finally:
            LocalFree(buf)


class WindowsNamedPipeTransport(Transport):
    """ connect to a named pipe """

    def __init__(self, sockpath):
        self.sockpath = u"\\\\.\\pipe\\{0}".format(sockpath)

        while True:
            self.pipe = CreateFile(
                self.sockpath,
                GENERIC_READ | GENERIC_WRITE,
                0,
                None,
                OPEN_EXISTING,
                FILE_FLAG_OVERLAPPED,
                None,
            )
            err1 = GetLastError()
            msg = _win32_strerror(err1)
            if self.pipe != INVALID_HANDLE_VALUE:
                break
            if err1 != ERROR_PIPE_BUSY:
                self.pipe = None
                raise NailgunException(msg, NailgunException.CONNECT_FAILED)
            if not WaitNamedPipe(self.sockpath, 5000):
                self.pipe = None
                raise NailgunException(
                    "time out while waiting for a pipe", NailgunException.CONNECT_FAILED
                )

        # event for the overlapped I/O operations
        self.read_waitable = CreateEvent(None, True, False, None)
        if self.read_waitable is None:
            raise NailgunException(
                "CreateEvent failed", NailgunException.CONNECT_FAILED
            )
        self.write_waitable = CreateEvent(None, True, False, None)
        if self.write_waitable is None:
            raise NailgunException(
                "CreateEvent failed", NailgunException.CONNECT_FAILED
            )

    def _raise_win_err(self, msg, err):
        raise IOError("%s win32 error code: %d %s" % (msg, err, _win32_strerror(err)))

    def close(self):
        if self.pipe:
            CloseHandle(self.pipe)
        self.pipe = None

        if self.read_waitable is not None:
            CloseHandle(self.read_waitable)
        self.read_waitable = None

        if self.write_waitable is not None:
            CloseHandle(self.write_waitable)
        self.write_waitable = None

    def recv_into(self, buffer, nbytes):
        # we don't use memoryview because OVERLAPPED I/O happens
        # after the method (ReadFile) returns
        buf = ctypes.create_string_buffer(nbytes)
        olap = OVERLAPPED()
        olap.hEvent = self.read_waitable

        immediate = ReadFile(self.pipe, buf, nbytes, None, olap)

        if not immediate:
            err = GetLastError()
            if err != ERROR_IO_PENDING:
                self._raise_win_err("failed to read %d bytes" % nbytes, GetLastError())

        nread = wintypes.DWORD()
        if not GetOverlappedResult(self.pipe, olap, nread, True):
            err = GetLastError()
            self._raise_win_err("error while waiting for read", err)

        nread = nread.value
        buffer[:nread] = buf[:nread]
        return nread

    def sendall(self, data):
        olap = OVERLAPPED()
        olap.hEvent = self.write_waitable
        p = (ctypes.c_ubyte * len(data))(*(bytearray(data)))
        immediate = WriteFile(self.pipe, p, len(data), None, olap)

        if not immediate:
            err = GetLastError()
            if err != ERROR_IO_PENDING:
                self._raise_win_err(
                    "failed to write %d bytes" % len(data), GetLastError()
                )

        # Obtain results, waiting if needed
        nwrote = wintypes.DWORD()
        if not GetOverlappedResult(self.pipe, olap, nwrote, True):
            err = GetLastError()
            self._raise_win_err("error while waiting for write", err)
        nwrote = nwrote.value
        if nwrote != len(data):
            raise IOError("Async wrote less bytes!")
        return nwrote

    def select(self, timeout_secs):
        start = monotonic_time_nanos()
        timeout_nanos = timeout_secs * NSEC_PER_SEC
        while True:
            readable, exceptional = self.select_now()
            if (
                readable
                or exceptional
                or monotonic_time_nanos() - start > timeout_nanos
            ):
                return readable, exceptional

    def select_now(self):
        available_total = wintypes.DWORD()
        exceptional = not PeekNamedPipe(self.pipe, None, 0, None, available_total, None)
        readable = available_total.value > 0
        result = readable, exceptional
        return result


class NailgunConnection(object):
    """Stateful object holding the connection to the Nailgun server."""

    def __init__(
        self,
        server_name,
        server_port=None,
        stdin=sys.stdin,
        stdout=sys.stdout,
        stderr=sys.stderr,
        cwd=None,
        heartbeat_interval_sec=DEFAULT_HEARTBEAT_INTERVAL_SEC,
    ):
        self.transport = make_nailgun_transport(server_name, server_port, cwd)
        self.stdin = stdin
        self.stdout = stdout
        self.stderr = stderr
        self.recv_flags = 0
        self.send_flags = 0
        self.header_buf = ctypes.create_string_buffer(CHUNK_HEADER_LEN)
        self.buf = ctypes.create_string_buffer(BUFSIZE)

        self.exit_code = None

        self.shutdown_event = Event()

        self.error_lock = RLock()
        self.error = None
        self.error_traceback = None

        self.stdin_condition = Condition()
        self.stdin_thread = Thread(target=stdin_thread_main, args=(self,))
        self.stdin_thread.daemon = True

        self.send_queue = Queue.Queue()
        self.send_condition = Condition()
        self.send_thread = Thread(target=send_thread_main, args=(self,))
        self.send_thread.daemon = True

        self.heartbeat_interval_sec = heartbeat_interval_sec
        self.heartbeat_condition = Condition()
        self.heartbeat_thread = None
        if heartbeat_interval_sec > 0:
            self.heartbeat_thread = Thread(target=heartbeat_thread_main, args=(self,))
            self.heartbeat_thread.daemon = True

    def send_command(
        self, cmd, cmd_args=[], filearg=None, env=os.environ, cwd=os.getcwd()
    ):
        """
        Sends the command and environment to the nailgun server, then loops forever
        reading the response until the server sends an exit chunk.

        Returns the exit value, or raises NailgunException on error.
        """
        try:
            return self._send_command_and_read_response(
                cmd, cmd_args, filearg, env, cwd
            )
        except socket.error as e:
            re_raise(
                NailgunException(
                    "Server disconnected unexpectedly: {0}".format(e),
                    NailgunException.CONNECTION_BROKEN,
                )
            )

    def _send_command_and_read_response(self, cmd, cmd_args, filearg, env, cwd):
        self.stdin_thread.start()
        self.send_thread.start()

        try:

            if filearg:
                self._send_file_arg(filearg)
            for cmd_arg in cmd_args:
                self._send_chunk(cmd_arg, CHUNKTYPE_ARG)
            self._send_env_var("NAILGUN_FILESEPARATOR", os.sep)
            self._send_env_var("NAILGUN_PATHSEPARATOR", os.pathsep)
            self._send_tty_format(self.stdin)
            self._send_tty_format(self.stdout)
            self._send_tty_format(self.stderr)
            for k, v in env.items():
                self._send_env_var(k, v)
            self._send_chunk(cwd, CHUNKTYPE_DIR)
            self._send_chunk(cmd, CHUNKTYPE_CMD)

            if self.heartbeat_thread is not None:
                self.heartbeat_thread.start()

            while self.exit_code is None:
                self._process_next_chunk()

        finally:

            self.shutdown_event.set()

            with self.stdin_condition:
                self.stdin_condition.notify()
            with self.send_condition:
                self.send_condition.notify()
            if self.heartbeat_thread is not None:
                with self.heartbeat_condition:
                    self.heartbeat_condition.notify()
                self.heartbeat_thread.join(THREAD_TERMINATION_TIMEOUT_SEC)
            self.stdin_thread.join(THREAD_TERMINATION_TIMEOUT_SEC)
            self.send_thread.join(THREAD_TERMINATION_TIMEOUT_SEC)

        return self.exit_code

    def _process_next_chunk(self):
        """
        Processes the next chunk from the nailgun server.
        """
        readable, exceptional = self.transport.select(SELECT_MAX_BLOCK_TIME_SEC)
        if readable:
            self._process_nailgun_stream()
        if exceptional:
            raise NailgunException(
                "Server disconnected in select", NailgunException.CONNECTION_BROKEN
            )

        # if daemon thread threw, rethrow here
        if self.shutdown_event.is_set():
            e = None
            e_tb = None
            with self.error_lock:
                e = self.error
                e_tb = self.error_traceback
            if e is not None:
                re_raise(e, e_tb)

    def _send_chunk(self, buf, chunk_type):
        """
        Send chunk to the server asynchronously
        """
        self.send_queue.put((chunk_type, buf))
        with self.send_condition:
            self.send_condition.notify()

    def _send_env_var(self, name, value):
        """
        Sends an environment variable in KEY=VALUE format.
        """
        self._send_chunk("=".join((name, value)), CHUNKTYPE_ENV)

    def _send_tty_format(self, f):
        """
        Sends a NAILGUN_TTY_# environment variable.
        """
        if not f or not hasattr(f, "fileno"):
            return
        try:
            fileno = f.fileno()
            isatty = os.isatty(fileno)
            self._send_env_var("NAILGUN_TTY_" + str(fileno), str(int(isatty)))
        except UnsupportedOperation:
            return

    def _send_file_arg(self, filename):
        """
        Sends the contents of a file to the server.
        """
        with open(filename) as f:
            while True:
                num_bytes = f.readinto(self.buf)
                if not num_bytes:
                    break
                self._send_chunk(self.buf.raw[:num_bytes], CHUNKTYPE_LONGARG)

    def _recv_to_fd(self, dest_file, num_bytes):
        """
        Receives num_bytes bytes from the nailgun socket and copies them to the specified file
        object. Used to route data to stdout or stderr on the client.
        """
        bytes_read = 0

        while bytes_read < num_bytes:
            bytes_to_read = min(len(self.buf), num_bytes - bytes_read)
            bytes_received = self.transport.recv_into(self.buf, bytes_to_read)
            if dest_file:
                dest_file.write(bytes_to_str(self.buf[:bytes_received]))
            bytes_read += bytes_received

    def _recv_to_buffer(self, num_bytes, buf):
        """
        Receives num_bytes from the nailgun socket and writes them into the specified buffer.
        """
        # We'd love to use socket.recv_into() everywhere to avoid
        # unnecessary copies, but we need to support Python 2.6. The
        # only way to provide an offset to recv_into() is to use
        # memoryview(), which doesn't exist until Python 2.7.
        if HAS_MEMORYVIEW:
            self._recv_into_memoryview(num_bytes, memoryview(buf))
        else:
            self._recv_to_buffer_with_copy(num_bytes, buf)

    def _recv_into_memoryview(self, num_bytes, buf_view):
        """
        Receives num_bytes from the nailgun socket and writes them into the specified memoryview
        to avoid an extra copy.
        """
        bytes_read = 0
        while bytes_read < num_bytes:
            bytes_received = self.transport.recv_into(
                buf_view[bytes_read:], num_bytes - bytes_read
            )
            if not bytes_received:
                raise NailgunException(
                    "Server unexpectedly disconnected in recv_into()",
                    NailgunException.CONNECTION_BROKEN,
                )
            bytes_read += bytes_received

    def _recv_to_buffer_with_copy(self, num_bytes, buf):
        """
        Receives num_bytes from the nailgun socket and writes them into the specified buffer.
        """
        bytes_read = 0
        while bytes_read < num_bytes:
            recv_buf = self.transport.recv(num_bytes - bytes_read)
            if not len(recv_buf):
                raise NailgunException(
                    "Server unexpectedly disconnected in recv()",
                    NailgunException.CONNECTION_BROKEN,
                )
            buf[bytes_read : bytes_read + len(recv_buf)] = recv_buf
            bytes_read += len(recv_buf)

    def _process_exit(self, exit_len):
        """
        Receives an exit code from the nailgun server and sets nailgun_connection.exit_code
        to indicate the client should exit.
        """
        num_bytes = min(len(self.buf), exit_len)
        self._recv_to_buffer(num_bytes, self.buf)
        self.exit_code = int(self.buf.raw[:num_bytes])

    def _send_heartbeat(self):
        """
        Sends a heartbeat to the nailgun server to indicate the client is still alive.
        """
        self._send_chunk("", CHUNKTYPE_HEARTBEAT)

    def _process_nailgun_stream(self):
        """
         Processes a single chunk from the nailgun server.
         """
        self._recv_to_buffer(len(self.header_buf), self.header_buf)
        (chunk_len, chunk_type) = struct.unpack_from(">ic", self.header_buf.raw)

        if chunk_type == CHUNKTYPE_STDOUT:
            self._recv_to_fd(self.stdout, chunk_len)
        elif chunk_type == CHUNKTYPE_STDERR:
            self._recv_to_fd(self.stderr, chunk_len)
        elif chunk_type == CHUNKTYPE_EXIT:
            self._process_exit(chunk_len)
        elif chunk_type == CHUNKTYPE_SENDINPUT:
            # signal stdin thread to get and send more data
            with self.stdin_condition:
                self.stdin_condition.notify()
        else:
            raise NailgunException(
                "Unexpected chunk type: {0}".format(chunk_type),
                NailgunException.UNEXPECTED_CHUNKTYPE,
            )

    def wait_termination(self, timeout):
        """
        Wait for shutdown event to be signalled within specified interval
        Return True if termination was signalled, False otherwise
        """
        wait_time = timeout
        start = monotonic_time_nanos()
        with self.send_condition:
            while True:
                if self.shutdown_event.is_set():
                    return True
                self.send_condition.wait(wait_time)
                elapsed = (monotonic_time_nanos() - start) * 1.0 / NSEC_PER_SEC
                wait_time = timeout - elapsed
                if wait_time <= 0:
                    return False
        return False

    def __enter__(self):
        return self

    def __exit__(self, type, value, traceback):
        try:
            self.transport.close()
        except socket.error:
            pass


def monotonic_time_nanos():
    """Returns a monotonically-increasing timestamp value in nanoseconds.

    The epoch of the return value is undefined. To use this, you must call
    it more than once and calculate the delta between two calls.
    """
    # This function should be overwritten below on supported platforms.
    raise Exception("Unsupported platform: " + platform.system())


if platform.system() == "Linux":
    # From <linux/time.h>, available since 2.6.28 (released 24-Dec-2008).
    CLOCK_MONOTONIC_RAW = 4
    librt = ctypes.CDLL("librt.so.1", use_errno=True)
    clock_gettime = librt.clock_gettime

    class struct_timespec(ctypes.Structure):
        _fields_ = [("tv_sec", ctypes.c_long), ("tv_nsec", ctypes.c_long)]

    clock_gettime.argtypes = [ctypes.c_int, ctypes.POINTER(struct_timespec)]

    def _monotonic_time_nanos_linux():
        t = struct_timespec()
        clock_gettime(CLOCK_MONOTONIC_RAW, ctypes.byref(t))
        return t.tv_sec * NSEC_PER_SEC + t.tv_nsec

    monotonic_time_nanos = _monotonic_time_nanos_linux
elif platform.system() == "Darwin":
    # From <mach/mach_time.h>
    KERN_SUCCESS = 0
    libSystem = ctypes.CDLL("/usr/lib/libSystem.dylib", use_errno=True)
    mach_timebase_info = libSystem.mach_timebase_info

    class struct_mach_timebase_info(ctypes.Structure):
        _fields_ = [("numer", ctypes.c_uint32), ("denom", ctypes.c_uint32)]

    mach_timebase_info.argtypes = [ctypes.POINTER(struct_mach_timebase_info)]
    mach_ti = struct_mach_timebase_info()
    ret = mach_timebase_info(ctypes.byref(mach_ti))
    if ret != KERN_SUCCESS:
        raise Exception("Could not get mach_timebase_info, error: " + str(ret))
    mach_absolute_time = libSystem.mach_absolute_time
    mach_absolute_time.restype = ctypes.c_uint64

    def _monotonic_time_nanos_darwin():
        return (mach_absolute_time() * mach_ti.numer) / mach_ti.denom

    monotonic_time_nanos = _monotonic_time_nanos_darwin
elif platform.system() == "Windows":
    # From <Winbase.h>
    perf_frequency = ctypes.c_uint64()
    ctypes.windll.kernel32.QueryPerformanceFrequency(ctypes.byref(perf_frequency))

    def _monotonic_time_nanos_windows():
        perf_counter = ctypes.c_uint64()
        ctypes.windll.kernel32.QueryPerformanceCounter(ctypes.byref(perf_counter))
        return perf_counter.value * NSEC_PER_SEC / perf_frequency.value

    monotonic_time_nanos = _monotonic_time_nanos_windows
elif sys.platform == "cygwin":
    k32 = ctypes.CDLL("Kernel32", use_errno=True)
    perf_frequency = ctypes.c_uint64()
    k32.QueryPerformanceFrequency(ctypes.byref(perf_frequency))

    def _monotonic_time_nanos_cygwin():
        perf_counter = ctypes.c_uint64()
        k32.QueryPerformanceCounter(ctypes.byref(perf_counter))
        return perf_counter.value * NSEC_PER_SEC / perf_frequency.value

    monotonic_time_nanos = _monotonic_time_nanos_cygwin


def send_thread_main(conn):
    """
    Sending thread worker function
    Waits for data and transmits it to server
    """
    try:
        header_buf = ctypes.create_string_buffer(CHUNK_HEADER_LEN)
        while True:
            connection_error = None
            while not conn.send_queue.empty():
                # only this thread can deplete the queue, so it is safe to use blocking get()
                (chunk_type, buf) = conn.send_queue.get()
                struct.pack_into(">ic", header_buf, 0, len(buf), chunk_type)
                bbuf = to_bytes(buf)

                # these chunk types are not required for server to accept and process and server may terminate
                # any time without waiting for them
                is_required = chunk_type not in (
                    CHUNKTYPE_HEARTBEAT,
                    CHUNKTYPE_STDIN,
                    CHUNKTYPE_STDIN_EOF,
                )

                try:
                    conn.transport.sendall(header_buf.raw)
                    conn.transport.sendall(bbuf)
                except socket.error as e:
                    # The server may send termination signal and close the socket immediately; attempt to write
                    # to such a socket (i.e. heartbeats) results in an error (SIGPIPE)
                    # Nailgun protocol is not duplex so the server does not wait on client to acknowledge
                    # We catch an exception and ignore it if termination has happened shortly afterwards
                    if not is_required and conn.wait_termination(
                        SEND_THREAD_WAIT_TERMINATION_SEC
                    ):
                        return
                    raise

            with conn.send_condition:
                if conn.shutdown_event.is_set():
                    return
                if not conn.send_queue.empty():
                    continue
                conn.send_condition.wait()
                if conn.shutdown_event.is_set():
                    return
    except Exception as e:
        # save exception to rethrow on main thread
        with conn.error_lock:
            conn.error = e
            conn.error_traceback = sys.exc_info()[2]
        conn.shutdown_event.set()


def stdin_thread_main(conn):
    """
    Stdin thread reading worker function
    If stdin is available, read it to internal buffer and send to server
    """
    try:
        eof = False
        while True:
            # wait for signal to read new line from stdin or shutdown
            # we  do not start reading from stdin before server actually requests that
            with conn.stdin_condition:
                if conn.shutdown_event.is_set():
                    return
                conn.stdin_condition.wait()
                if conn.shutdown_event.is_set():
                    return

            if not conn.stdin or eof:
                conn._send_chunk(buf, CHUNKTYPE_STDIN_EOF)
                continue

            buf = conn.stdin.readline()
            if buf == "":
                eof = True
                conn._send_chunk(buf, CHUNKTYPE_STDIN_EOF)
                continue
            conn._send_chunk(buf, CHUNKTYPE_STDIN)
    except Exception as e:
        # save exception to rethrow on main thread
        with conn.error_lock:
            conn.error = e
            conn.error_traceback = sys.exc_info()[2]
        conn.shutdown_event.set()


def heartbeat_thread_main(conn):
    """
    Heartbeat thread worker function
    Periodically sends heartbeats to server as long as command is running
    """
    try:
        while True:
            with conn.heartbeat_condition:
                if conn.shutdown_event.is_set():
                    return
                conn.heartbeat_condition.wait(conn.heartbeat_interval_sec)
                if conn.shutdown_event.is_set():
                    return
            conn._send_heartbeat()

    except Exception as e:
        # save exception to rethrow on main thread
        with conn.error_lock:
            conn.error = e
            conn.error_traceback = sys.exc_info()[2]
        conn.shutdown_event.set()


def make_nailgun_transport(nailgun_server, nailgun_port=None, cwd=None):
    """
    Creates and returns a socket connection to the nailgun server.
    """
    transport = None
    if nailgun_server.startswith("local:"):
        if platform.system() == "Windows":
            pipe_addr = nailgun_server[6:]
            transport = WindowsNamedPipeTransport(pipe_addr)
        else:
            try:
                s = socket.socket(socket.AF_UNIX)
            except socket.error as msg:
                re_raise(
                    NailgunException(
                        "Could not create local socket connection to server: {0}".format(
                            msg
                        ),
                        NailgunException.SOCKET_FAILED,
                    )
                )
            socket_addr = nailgun_server[6:]
            prev_cwd = os.getcwd()
            try:
                if cwd is not None:
                    os.chdir(cwd)
                s.connect(socket_addr)
                transport = UnixTransport(s)
            except socket.error as msg:
                re_raise(
                    NailgunException(
                        "Could not connect to local server at {0}: {1}".format(
                            socket_addr, msg
                        ),
                        NailgunException.CONNECT_FAILED,
                    )
                )
            finally:
                if cwd is not None:
                    os.chdir(prev_cwd)
    else:
        socket_addr = nailgun_server
        socket_family = socket.AF_UNSPEC
        for (af, socktype, proto, _, sa) in socket.getaddrinfo(
            nailgun_server, nailgun_port, socket.AF_UNSPEC, socket.SOCK_STREAM
        ):
            try:
                s = socket.socket(af, socktype, proto)
            except socket.error as msg:
                s = None
                continue
            try:
                s.connect(sa)
                transport = UnixTransport(s)
            except socket.error as msg:
                s.close()
                s = None
                continue
            break
    if transport is None:
        raise NailgunException(
            "Could not connect to server {0}:{1}".format(nailgun_server, nailgun_port),
            NailgunException.CONNECT_FAILED,
        )
    return transport


if is_py2:
    exec(
        '''
def re_raise(ex, ex_trace = None):
    """
    Throw ex and preserve stack trace of original exception if we run on Python 2
    """
    if ex_trace is None:
        ex_trace = sys.exc_info()[2]
    raise ex, None, ex_trace
    '''
    )
else:

    def re_raise(ex, ex_trace=None):
        """
        Throw ex and preserve stack trace of original exception if we run on Python 2
        """
        raise ex


def main():
    """
    Main entry point to the nailgun client.
    """
    default_nailgun_server = os.environ.get("NAILGUN_SERVER", "127.0.0.1")
    default_nailgun_port = int(os.environ.get("NAILGUN_PORT", NAILGUN_PORT_DEFAULT))

    parser = optparse.OptionParser(usage="%prog [options] cmd arg1 arg2 ...")
    parser.add_option("--nailgun-server", default=default_nailgun_server)
    parser.add_option("--nailgun-port", type="int", default=default_nailgun_port)
    parser.add_option("--nailgun-filearg")
    parser.add_option("--nailgun-showversion", action="store_true")
    parser.add_option("--nailgun-help", action="help")
    (options, args) = parser.parse_args()

    if options.nailgun_showversion:
        print("NailGun client version " + NAILGUN_VERSION)

    if len(args):
        cmd = args.pop(0)
    else:
        cmd = os.path.basename(sys.argv[0])

    # Pass any remaining command line arguments to the server.
    cmd_args = args

    try:
        with NailgunConnection(
            options.nailgun_server, server_port=options.nailgun_port
        ) as c:
            exit_code = c.send_command(cmd, cmd_args, options.nailgun_filearg)
            sys.exit(exit_code)
    except NailgunException as e:
        sys.stderr.write(str(e))
        sys.exit(e.code)
    except KeyboardInterrupt as e:
        pass


if __name__ == "__main__":
    main()
