class NetworkTranslator:
    COMMAND_TEMPLATES = {
        "cisco": {
            "show interfaces": "show interfaces",
            "show ip route": "show ip route",
            "show running-config": "show running-config",
            "show version": "show version",
            "show ip interface brief": "show ip interface brief",
        },
        "juniper": {
            "show interfaces": "show interfaces",
            "show ip route": "show route protocol all",
            "show running-config": "show configuration",
            "show version": "show version",
            "show ip interface brief": "show interfaces terse",
        },
        "arista": {
            "show interfaces": "show interfaces",
            "show ip route": "show ip route",
            "show running-config": "show running-config",
            "show version": "show version",
            "show ip interface brief": "show ip interface brief",
        },
    }

    def parse_input(self, user_input: str) -> dict:
        user_input = user_input.lower().strip()

        vendor = None
        for v in self.COMMAND_TEMPLATES.keys():
            if v in user_input:
                vendor = v
                break

        if not vendor:
            raise ValueError("No vendor specified (cisco, juniper, arista)")

        command_keywords = [
            "show interfaces",
            "show ip interface brief",
            "show ip route",
            "show running-config",
            "show version",
        ]

        command = None
        for kw in command_keywords:
            if kw in user_input:
                command = kw
                break

        if not command:
            raise ValueError("No valid command found in input")

        return {"vendor": vendor, "command": command}


if __name__ == "__main__":
    translator = NetworkTranslator()

    test_inputs = [
        "cisco show interfaces",
        "juniper show ip route",
        "arista show version",
    ]

    for inp in test_inputs:
        result = translator.parse_input(inp)
        original_cmd = result["command"]
        translated_cmd = translator.COMMAND_TEMPLATES[result["vendor"]].get(original_cmd, original_cmd)
        print(f"Input: '{inp}'")
        print(f"  → Vendor: {result['vendor']}, Command: {original_cmd}")
        print(f"  → Translated: {translated_cmd}\n")