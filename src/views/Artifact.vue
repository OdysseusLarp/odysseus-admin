<template>
    <b-container fluid class="my-4">
        <table>
            <tr>
                <td class="td">
                    <p class="title">{{ this.artifact.code }}: {{ this.artifactId }}</p>
                    <p>{{ this.artifact.info }}</p>
                </td>
                <td class="td">
                    <p>
                        <span style="font-weight: bold;">State: {{ this.state }}</span><br />
                        <span :style="{ color: this.artifact.solved ? 'green' : 'red' }">
                            {{ this.artifact.solved ? 'Solved' : 'Unsolved' }}
                        </span><br />
                        <span :style="{ color: this.artifact.gm_approved ? 'green' : 'red' }">
                            {{ this.artifact.gm_approved ? 'GM approved' : 'Not approved' }}
                        </span><br />
                        <span :style="{ color: this.artifact.activated ? 'green' : 'red' }">
                            {{ this.artifact.activated ? 'Activated' : 'Not activated' }}
                        </span>
                    </p>
                </td>
                <td class="td">
                    <a v-if="!this.artifact.solved" href="#" @click="write({ solved: true })">Mark solved</a>
                    <a v-if="this.artifact.solved" href="#" @click="write({ solved: false })">Mark unsolved</a>
                    <br/>
                    <a v-if="!this.artifact.gm_approved" href="#" @click="write({ gm_approved: true, activated: false })">Approve use</a>
                    <a v-if="this.artifact.gm_approved" href="#" @click="write({ gm_approved: false })">Unapprove use</a>
                    <br/>
                    <a href="#" @click="write({ solved: true, gm_approved: true, activated: true })">Activate now</a>
                </td>
            </tr>
        </table>
    </b-container>
</template>

<script>
import axios from "axios";

export default {
    props: {
        artifactId: {
            type: String,
            required: true
        }
    },
    components: {},
    data() {
        return {
            channels: {},
            selectedChannel: undefined,
        };
    },
    computed: {
        artifact() {
            return this.$store.state.dataBlobs.find((e) => e.type === 'artifact' && e.id === this.artifactId);
        },
        state() {
            if (!this.artifact) {
                return 'NOT FOUND';
            }
            return !this.artifact.solved ? "Unsolved" :
                (!this.artifact.gm_approved && !this.artifact.activated) ? "Pending approval (initial)" :
                    (this.artifact.gm_approved && !this.artifact.activated) ? "GM approved" :
                        (this.artifact.gm_approved && this.artifact.activated) ? "Activated (transient)" :
                            (!this.artifact.gm_approved && this.artifact.activated) ? "Pending approval (used)" :
                                "UNKNOWN";;
        }
    },

    methods: {
        write(data) {
            if (
                confirm(
                    "Do you want to update the state?\n" +
                    JSON.stringify(data, undefined, 2)
                )
            ) {
                console.log("Updating artifact state:", data);
                axios
                    .patch(`/data/artifact/${this.artifactId}?force=true`, data)
                    .then((_response) => {
                        console.log("Success");
                        this.$notify({
                            title: "State updated",
                            type: "success",
                        });
                    })
                    .catch((error) => {
                        console.log("Error saving data blob:", error);
                        this.$notify({
                            title: "Error saving data",
                            text: "" + error,
                            type: "error",
                        });
                    });
            }
        }
    },
};
</script>

<style lang="scss" scoped>
.title {
    font-size: 18px;
    font-weight: bold;
}

table {
    width: 100%;
}

.td {
    width: 30%;
    vertical-align: top;
}
</style>