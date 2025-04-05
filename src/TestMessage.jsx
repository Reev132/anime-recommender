function TestMessage({ message, type }) {
    const messageStyle = {
        color: type === 'error' ? 'red' : 'green',
        marginTop: '20px',
        fontWeight: 'bold',
        padding: '10px',
        borderRadius: '5px',
        backgroundColor: type === 'error' ? '#ffe6e6' : '#e6ffe6',
        textAlign: 'center'
    };

    return (
        <div style={messageStyle}>
            {message}
        </div>
    );
}

export default TestMessage;
